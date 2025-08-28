export class ExecutionResult {
  constructor(data) {
    this.stepId = data.stepId;
    this.command = data.command;
    this.exitCode = data.exitCode;
    this.stdout = data.stdout || '';
    this.stderr = data.stderr || '';
    this.duration = data.duration || 0;
    this.workingDirectory = data.workingDirectory;
    this.success = data.success || false;
    this.error = data.error || null;
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      stepId: this.stepId,
      command: this.command,
      exitCode: this.exitCode,
      stdout: this.stdout,
      stderr: this.stderr,
      duration: this.duration,
      workingDirectory: this.workingDirectory,
      success: this.success,
      error: this.error,
      timestamp: this.timestamp.toISOString()
    };
  }

  toString() {
    let output = `Step ${this.stepId}: ${this.success ? 'SUCCESS' : 'FAILED'}\n`;
    output += `Command: ${this.command}\n`;
    output += `Exit Code: ${this.exitCode}\n`;
    output += `Duration: ${this.duration}ms\n`;
    
    if (this.stdout) {
      output += `Output:\n${this.stdout}\n`;
    }
    
    if (this.stderr) {
      output += `Error Output:\n${this.stderr}\n`;
    }
    
    if (this.error) {
      output += `Error: ${this.error}\n`;
    }
    
    return output;
  }

  getFormattedOutput() {
    if (this.success && this.stdout) {
      return this.stdout;
    } else if (!this.success && this.stderr) {
      return this.stderr;
    } else if (this.error) {
      return this.error;
    }
    return 'No output';
  }
}