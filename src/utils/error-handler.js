// src/utils/error-handler.js
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const os = require('os');

class ErrorHandler {
  constructor() {
    this.logFile = path.join(os.homedir(), '.eleven-cli', 'error.log');
    this.ensureLogDir();
  }

  ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      try {
        fs.mkdirSync(logDir, { recursive: true });
      } catch (error) {
        // Silently fail if can't create log directory
      }
    }
  }

  logError(error, context = '') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${context}\nError: ${error.message}\nStack: ${error.stack}\n---\n`;
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (logError) {
      // Can't log to file, continue silently
    }
  }

  handleApiKeyError(error) {
    console.error(chalk.red('❌ API Key Error'));
    
    if (error.message.includes('not found') || error.message.includes('missing')) {
      console.log(chalk.yellow('🔑 API key is not configured.'));
      console.log(chalk.gray('   Setup: el config'));
      console.log(chalk.gray('   Or set environment variable: GEMINI_API_KEY'));
    } else if (error.message.includes('invalid') || error.message.includes('unauthorized')) {
      console.log(chalk.yellow('🔑 API key is invalid.'));
      console.log(chalk.gray('   Check your key: el config --show'));
      console.log(chalk.gray('   Get new key: https://makersuite.google.com/app/apikey'));
    } else {
      console.log(chalk.yellow(`🔑 API key issue: ${error.message}`));
    }
    
    this.logError(error, 'API_KEY_ERROR');
  }

  handleNetworkError(error) {
    console.error(chalk.red('❌ Network Error'));
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log(chalk.yellow('🌐 Cannot connect to Gemini API.'));
      console.log(chalk.gray('   • Check your internet connection'));
      console.log(chalk.gray('   • Try again in a few moments'));
      console.log(chalk.gray('   • Check if a proxy is blocking requests'));
    } else if (error.message.includes('timeout')) {
      console.log(chalk.yellow('⏱️  Request timed out.'));
      console.log(chalk.gray('   • The API might be experiencing issues'));
      console.log(chalk.gray('   • Try a shorter prompt'));
      console.log(chalk.gray('   • Try again later'));
    } else {
      console.log(chalk.yellow(`🌐 Network issue: ${error.message}`));
    }
    
    this.logError(error, 'NETWORK_ERROR');
  }

  handleRateLimitError(error) {
    console.error(chalk.red('❌ Rate Limit Exceeded'));
    console.log(chalk.yellow('⏰ You\'ve hit the API rate limit.'));
    console.log(chalk.gray('Solutions:'));
    console.log(chalk.gray('   • Wait a moment and try again'));
    console.log(chalk.gray('   • Add more API keys: el config -a YOUR_SECOND_KEY'));
    console.log(chalk.gray('   • Enable rotation: el config -r'));
    console.log(chalk.gray('   • Consider upgrading your Gemini plan'));
    
    this.logError(error, 'RATE_LIMIT_ERROR');
  }

  handleFileError(error, filePath = '') {
    console.error(chalk.red('❌ File Operation Error'));
    
    if (error.code === 'ENOENT') {
      console.log(chalk.yellow(`📁 File not found: ${filePath}`));
      console.log(chalk.gray('   • Check the file path'));
      console.log(chalk.gray('   • Ensure the file exists'));
    } else if (error.code === 'EACCES') {
      console.log(chalk.yellow(`🔒 Permission denied: ${filePath}`));
      console.log(chalk.gray('   • Check file permissions'));
      console.log(chalk.gray('   • Try running with administrator privileges'));
    } else if (error.code === 'ENOSPC') {
      console.log(chalk.yellow('💾 Not enough disk space.'));
      console.log(chalk.gray('   • Free up some disk space'));
      console.log(chalk.gray('   • Try a different location'));
    } else {
      console.log(chalk.yellow(`📁 File operation failed: ${error.message}`));
    }
    
    this.logError(error, `FILE_ERROR: ${filePath}`);
  }

  handleConfigError(error) {
    console.error(chalk.red('❌ Configuration Error'));
    console.log(chalk.yellow(`⚙️  Config issue: ${error.message}`));
    console.log(chalk.gray('Solutions:'));
    console.log(chalk.gray('   • Reset config: el config --reset'));
    console.log(chalk.gray('   • Reconfigure: el config'));
    console.log(chalk.gray('   • Check permissions to home directory'));
    
    this.logError(error, 'CONFIG_ERROR');
  }

  handleGenericError(error, context = '') {
    console.error(chalk.red('❌ Unexpected Error'));
    console.log(chalk.yellow(`🔧 ${error.message}`));
    
    if (context) {
      console.log(chalk.gray(`   Context: ${context}`));
    }
    
    console.log(chalk.gray('If this error persists:'));
    console.log(chalk.gray('   • Check health: el health'));
    console.log(chalk.gray('   • Reset config: el config --reset'));
    console.log(chalk.gray(`   • Check logs: ${this.logFile}`));
    
    this.logError(error, context || 'GENERIC_ERROR');
  }

  handleError(error, context = '') {
    // Determine error type and handle appropriately
    if (!error) return;
    
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('api') && (errorMessage.includes('key') || errorMessage.includes('unauthorized'))) {
      this.handleApiKeyError(error);
    } else if (errorMessage.includes('network') || errorMessage.includes('enotfound') || errorMessage.includes('timeout')) {
      this.handleNetworkError(error);
    } else if (errorMessage.includes('rate') || errorMessage.includes('quota') || errorMessage.includes('429')) {
      this.handleRateLimitError(error);
    } else if (error.code && ['ENOENT', 'EACCES', 'ENOSPC'].includes(error.code)) {
      this.handleFileError(error, context);
    } else if (errorMessage.includes('config')) {
      this.handleConfigError(error);
    } else {
      this.handleGenericError(error, context);
    }
  }

  // Utility method to wrap async functions with error handling
  wrapAsync(fn, context = '') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, context);
        process.exit(1);
      }
    };
  }

  // Get recent errors for troubleshooting
  getRecentErrors(count = 10) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }
      
      const logContent = fs.readFileSync(this.logFile, 'utf8');
      const entries = logContent.split('---\n').filter(entry => entry.trim());
      return entries.slice(-count);
    } catch (error) {
      return [];
    }
  }

  // Clear error log
  clearLog() {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.unlinkSync(this.logFile);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }
}

module.exports = new ErrorHandler();
