import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { ConfigManager } from '../utils/ConfigManager.js';
import { LoggingUtil } from '../utils/LoggingUtil.js';
import { ExecutionResult } from '../models/ExecutionResult.js';
import { SandboxException } from '../exceptions/SandboxException.js';

export class SandboxExecutor {
  constructor() {
    this.config = ConfigManager.getInstance();
    this.logger = LoggingUtil.getInstance();
    this.workDir = this.config.get('sandbox.workdir', '/tmp/forge-work');
    this.timeout = this.config.get('sandbox.timeout', 30000);
    this.maxMemoryMB = this.config.get('sandbox.maxMemoryMB', 512);
  }

  async initialize() {
    try {
      // Ensure work directory exists
      await fs.mkdir(this.workDir, { recursive: true });
      
      // Set up sandbox environment
      await this._setupSandboxEnvironment();
      
      this.logger.info('Sandbox initialized', { workDir: this.workDir });
    } catch (error) {
      throw new SandboxException(`Failed to initialize sandbox: ${error.message}`);
    }
  }

  async executeStep(step) {
    try {
      this.logger.info('Executing step', { stepId: step.id, command: step.command });

      const startTime = Date.now();
      const workingDir = step.workingDirectory || this.workDir;

      // Ensure working directory exists and is safe
      await this._validateWorkingDirectory(workingDir);

      const result = await this._runCommand(step.command, workingDir);
      const duration = Date.now() - startTime;

      const executionResult = new ExecutionResult({
        stepId: step.id,
        command: step.command,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        duration,
        workingDirectory: workingDir,
        success: result.exitCode === 0
      });

      this.logger.info('Step execution completed', {
        stepId: step.id,
        success: executionResult.success,
        duration
      });

      return executionResult;
    } catch (error) {
      this.logger.error('Step execution failed', { 
        stepId: step.id, 
        error: error.message 
      });
      
      return new ExecutionResult({
        stepId: step.id,
        command: step.command,
        exitCode: -1,
        stdout: '',
        stderr: error.message,
        duration: 0,
        workingDirectory: step.workingDirectory || this.workDir,
        success: false,
        error: error.message
      });
    }
  }

  async _runCommand(command, workingDir) {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = this._parseCommand(command);
      
      const child = spawn(cmd, args, {
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: this._getSandboxEnvironment(),
        timeout: this.timeout
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (exitCode) => {
        resolve({
          exitCode: exitCode || 0,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });

      child.on('error', (error) => {
        reject(new SandboxException(`Command execution failed: ${error.message}`));
      });

      // Handle timeout
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGTERM');
          reject(new SandboxException(`Command timed out after ${this.timeout}ms`));
        }
      }, this.timeout);
    });
  }

  _parseCommand(command) {
    // Simple command parsing - in production, you might want more sophisticated parsing
    return command.trim().split(/\s+/);
  }

  _getSandboxEnvironment() {
    return {
      ...process.env,
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOME: this.workDir,
      TMPDIR: path.join(this.workDir, 'tmp'),
      // Limit environment variables for security
      USER: 'forge-user',
      SHELL: '/bin/bash'
    };
  }

  async _setupSandboxEnvironment() {
    // Create necessary subdirectories
    const dirs = ['tmp', 'logs', 'workspace'];
    for (const dir of dirs) {
      await fs.mkdir(path.join(this.workDir, dir), { recursive: true });
    }

    // Set up basic configuration files if needed
    const bashrc = path.join(this.workDir, '.bashrc');
    if (!(await this._fileExists(bashrc))) {
      await fs.writeFile(bashrc, '# Forge CLI Sandbox Environment\nexport PS1="forge-sandbox$ "\n');
    }
  }

  async _validateWorkingDirectory(workingDir) {
    try {
      // Ensure the directory exists
      await fs.mkdir(workingDir, { recursive: true });
      
      // Check if it's within allowed paths
      const resolvedPath = path.resolve(workingDir);
      const allowedPaths = [
        path.resolve(this.workDir),
        path.resolve(process.cwd()),
        path.resolve(process.env.HOME || '/tmp')
      ];

      const isAllowed = allowedPaths.some(allowedPath => 
        resolvedPath.startsWith(allowedPath)
      );

      if (!isAllowed) {
        throw new SandboxException(`Working directory not allowed: ${workingDir}`);
      }
    } catch (error) {
      throw new SandboxException(`Invalid working directory: ${error.message}`);
    }
  }

  async _fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async cleanup() {
    try {
      // Clean up temporary files older than 1 hour
      const tmpDir = path.join(this.workDir, 'tmp');
      const files = await fs.readdir(tmpDir);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(tmpDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < oneHourAgo) {
          await fs.unlink(filePath);
        }
      }

      this.logger.info('Sandbox cleanup completed');
    } catch (error) {
      this.logger.warn('Sandbox cleanup failed', { error: error.message });
    }
  }
}