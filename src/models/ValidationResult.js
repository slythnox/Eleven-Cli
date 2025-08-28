export class ValidationResult {
  constructor(data) {
    this.stepId = data.stepId;
    this.command = data.command;
    this.allowed = data.allowed || false;
    this.riskLevel = data.riskLevel || 'low';
    this.warnings = data.warnings || [];
    this.blockedReasons = data.blockedReasons || [];
    this.requiresConfirmation = data.requiresConfirmation || false;
    this.suggestions = data.suggestions || [];
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      stepId: this.stepId,
      command: this.command,
      allowed: this.allowed,
      riskLevel: this.riskLevel,
      warnings: this.warnings,
      blockedReasons: this.blockedReasons,
      requiresConfirmation: this.requiresConfirmation,
      suggestions: this.suggestions,
      timestamp: this.timestamp.toISOString()
    };
  }

  toString() {
    let output = `Validation for Step ${this.stepId}: ${this.allowed ? 'ALLOWED' : 'BLOCKED'}\n`;
    output += `Command: ${this.command}\n`;
    output += `Risk Level: ${this.riskLevel}\n`;
    
    if (this.requiresConfirmation) {
      output += `Requires Confirmation: Yes\n`;
    }
    
    if (this.warnings.length > 0) {
      output += `Warnings:\n`;
      this.warnings.forEach(warning => {
        output += `  - ${warning}\n`;
      });
    }
    
    if (this.blockedReasons.length > 0) {
      output += `Blocked Reasons:\n`;
      this.blockedReasons.forEach(reason => {
        output += `  - ${reason}\n`;
      });
    }
    
    if (this.suggestions.length > 0) {
      output += `Suggestions:\n`;
      this.suggestions.forEach(suggestion => {
        output += `  - ${suggestion}\n`;
      });
    }
    
    return output;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  isBlocked() {
    return !this.allowed;
  }

  isHighRisk() {
    return this.riskLevel === 'high';
  }
}