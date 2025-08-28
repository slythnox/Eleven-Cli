import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'yaml';
import { ConfigManager } from '../utils/ConfigManager.js';
import { LoggingUtil } from '../utils/LoggingUtil.js';
import { ValidationResult } from '../models/ValidationResult.js';
import { ValidationException } from '../exceptions/ValidationException.js';

export class Validator {
  constructor() {
    this.config = ConfigManager.getInstance();
    this.logger = LoggingUtil.getInstance();
    this.denylist = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      await this._loadDenylist();
      this.initialized = true;
      this.logger.info('Validator initialized');
    } catch (error) {
      throw new ValidationException(`Failed to initialize validator: ${error.message}`);
    }
  }

  async validateStep(step) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const result = new ValidationResult({
        stepId: step.id,
        command: step.command,
        allowed: true,
        riskLevel: step.riskLevel || 'low',
        warnings: [],
        blockedReasons: []
      });

      // Check against denylist
      const denylistCheck = this._checkDenylist(step.command);
      if (!denylistCheck.allowed) {
        result.allowed = false;
        result.blockedReasons.push(...denylistCheck.reasons);
      }

      // Analyze risk level
      const riskAnalysis = this._analyzeRiskLevel(step.command);
      result.riskLevel = Math.max(
        this._getRiskLevelValue(result.riskLevel),
        this._getRiskLevelValue(riskAnalysis.level)
      );
      result.warnings.push(...riskAnalysis.warnings);

      // Check for high-risk operations
      const highRiskCheck = this._checkHighRiskOperations(step.command);
      if (highRiskCheck.isHighRisk) {
        result.riskLevel = Math.max(result.riskLevel, this._getRiskLevelValue('high'));
        result.warnings.push(...highRiskCheck.warnings);
        result.requiresConfirmation = true;
      }

      // Convert risk level back to string
      result.riskLevel = this._getRiskLevelString(result.riskLevel);

      this.logger.debug('Step validation completed', {
        stepId: step.id,
        allowed: result.allowed,
        riskLevel: result.riskLevel,
        warningCount: result.warnings.length
      });

      return result;
    } catch (error) {
      this.logger.error('Step validation failed', { 
        stepId: step.id, 
        error: error.message 
      });
      throw new ValidationException(`Validation failed: ${error.message}`);
    }
  }

  async validatePlan(plan) {
    const results = [];
    let overallAllowed = true;
    let maxRiskLevel = 0;

    for (const step of plan.steps) {
      const result = await this.validateStep(step);
      results.push(result);
      
      if (!result.allowed) {
        overallAllowed = false;
      }
      
      maxRiskLevel = Math.max(maxRiskLevel, this._getRiskLevelValue(result.riskLevel));
    }

    return {
      allowed: overallAllowed,
      riskLevel: this._getRiskLevelString(maxRiskLevel),
      stepResults: results,
      summary: this._generateValidationSummary(results)
    };
  }

  async _loadDenylist() {
    try {
      const denylistPath = this.config.get('security.denylistFile', 'src/config/denylist.yaml');
      const denylistContent = await fs.readFile(denylistPath, 'utf8');
      this.denylist = yaml.parse(denylistContent);
    } catch (error) {
      // If denylist file doesn't exist, use default rules
      this.denylist = this._getDefaultDenylist();
      this.logger.warn('Using default denylist rules', { error: error.message });
    }
  }

  _checkDenylist(command) {
    const result = { allowed: true, reasons: [] };
    
    if (!this.denylist) {
      return result;
    }

    // Check exact command matches
    if (this.denylist.commands) {
      for (const blockedCmd of this.denylist.commands) {
        if (command.includes(blockedCmd)) {
          result.allowed = false;
          result.reasons.push(`Blocked command pattern: ${blockedCmd}`);
        }
      }
    }

    // Check regex patterns
    if (this.denylist.patterns) {
      for (const pattern of this.denylist.patterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(command)) {
            result.allowed = false;
            result.reasons.push(`Blocked by pattern: ${pattern}`);
          }
        } catch (error) {
          this.logger.warn('Invalid regex pattern in denylist', { pattern, error: error.message });
        }
      }
    }

    return result;
  }

  _analyzeRiskLevel(command) {
    const warnings = [];
    let level = 'none';

    // File operations
    if (/\b(rm|del|delete|mv|move|cp|copy)\b/i.test(command)) {
      level = 'low';
      if (/\b(rm\s+-rf|del\s+\/[qsf])\b/i.test(command)) {
        level = 'high';
        warnings.push('Destructive file operation detected');
      }
    }

    // System operations
    if (/\b(sudo|su|chmod|chown|systemctl|service)\b/i.test(command)) {
      level = 'high';
      warnings.push('System-level operation detected');
    }

    // Network operations
    if (/\b(curl|wget|ssh|scp|rsync)\b/i.test(command)) {
      level = 'medium';
      if (/\|\s*(bash|sh|zsh|fish)\b/i.test(command)) {
        level = 'high';
        warnings.push('Network download with shell execution detected');
      }
    }

    // Package managers
    if (/\b(apt|yum|dnf|pacman|brew|npm|pip|gem)\s+install\b/i.test(command)) {
      level = 'medium';
      warnings.push('Package installation detected');
    }

    // Process operations
    if (/\b(kill|killall|pkill)\b/i.test(command)) {
      level = 'medium';
      if (/kill\s+-9\s+-1/i.test(command)) {
        level = 'high';
        warnings.push('System-wide process termination detected');
      }
    }

    return { level, warnings };
  }

  _checkHighRiskOperations(command) {
    const highRiskPatterns = [
      { pattern: /\bformat\s+[A-Z]:/i, warning: 'Disk formatting operation' },
      { pattern: /\bfdisk\b/i, warning: 'Disk partitioning operation' },
      { pattern: /\bmkfs\b/i, warning: 'Filesystem creation operation' },
      { pattern: /\bdd\s+if=.*of=\/dev\//i, warning: 'Direct disk write operation' },
      { pattern: /\bchmod\s+777\b/i, warning: 'Overly permissive file permissions' },
      { pattern: /\brm\s+-rf\s+\/\b/i, warning: 'Root filesystem deletion attempt' }
    ];

    const warnings = [];
    let isHighRisk = false;

    for (const { pattern, warning } of highRiskPatterns) {
      if (pattern.test(command)) {
        isHighRisk = true;
        warnings.push(warning);
      }
    }

    // Check if command is in high-risk list from denylist
    if (this.denylist?.highRisk) {
      for (const riskCmd of this.denylist.highRisk) {
        if (command.includes(riskCmd)) {
          isHighRisk = true;
          warnings.push(`High-risk operation: ${riskCmd}`);
        }
      }
    }

    return { isHighRisk, warnings };
  }

  _getRiskLevelValue(level) {
    const levels = { none: 0, low: 1, medium: 2, high: 3 };
    return levels[level] || 1;
  }

  _getRiskLevelString(value) {
    const levels = ['none', 'low', 'medium', 'high'];
    return levels[value] || 'low';
  }

  _generateValidationSummary(results) {
    const blocked = results.filter(r => !r.allowed).length;
    const warnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    const highRisk = results.filter(r => r.riskLevel === 'high').length;

    return {
      totalSteps: results.length,
      blockedSteps: blocked,
      totalWarnings: warnings,
      highRiskSteps: highRisk,
      overallSafe: blocked === 0 && highRisk === 0
    };
  }

  _getDefaultDenylist() {
    return {
      commands: [
        'rm -rf /',
        'rm -rf /*',
        'rm -rf ~',
        'rm -rf $HOME',
        'dd if=/dev/zero',
        'mkfs',
        'fdisk',
        'format',
        'sudo rm',
        'chmod 777',
        'curl | bash',
        'wget | sh'
      ],
      patterns: [
        'rm\\s+-rf\\s+/',
        'chmod\\s+777\\s+',
        '\\|\\s*bash',
        '\\|\\s*sh',
        '>/dev/sd[a-z]'
      ],
      highRisk: [
        'git reset --hard',
        'git clean -fd',
        'npm ci',
        'docker system prune'
      ]
    };
  }
}