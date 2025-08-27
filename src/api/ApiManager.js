import { GenerativeAI } from '@google/generative-ai';
import { ConfigManager } from '../utils/ConfigManager.js';
import { LoggingUtil } from '../utils/LoggingUtil.js';
import { ApiException } from '../exceptions/ApiException.js';

export class ApiManager {
  constructor() {
    this.config = ConfigManager.getInstance();
    this.logger = LoggingUtil.getInstance();
    this.apiKeys = [];
    this.currentKeyIndex = 0;
    this.clients = new Map();
    this.retryCount = 0;
    this.maxRetries = 3;
    this.backoffMultiplier = 2;
    this.baseDelay = 1000;
  }

  async initialize() {
    try {
      // Load API keys from configuration
      const keysConfig = this.config.get('gemini.apiKeys', '');
      this.apiKeys = keysConfig.split(',').map(key => key.trim()).filter(key => key);
      
      if (this.apiKeys.length === 0) {
        throw new Error('No API keys configured');
      }

      // Initialize clients for each API key
      for (let i = 0; i < this.apiKeys.length; i++) {
        const client = new GenerativeAI(this.apiKeys[i]);
        this.clients.set(i, client);
      }

      this.logger.info('API Manager initialized', { 
        keyCount: this.apiKeys.length,
        model: this.config.get('gemini.model', 'gemini-1.5-flash')
      });
    } catch (error) {
      throw new ApiException(`Failed to initialize API Manager: ${error.message}`);
    }
  }

  async getModel() {
    const client = this.getCurrentClient();
    const modelName = this.config.get('gemini.model', 'gemini-1.5-flash');
    
    try {
      return client.getGenerativeModel({ model: modelName });
    } catch (error) {
      this.logger.error('Failed to get model', { 
        keyIndex: this.currentKeyIndex,
        model: modelName,
        error: error.message 
      });
      throw new ApiException(`Failed to get model: ${error.message}`);
    }
  }

  getCurrentClient() {
    const client = this.clients.get(this.currentKeyIndex);
    if (!client) {
      throw new ApiException('No valid API client available');
    }
    return client;
  }

  async rotateKey() {
    if (this.apiKeys.length <= 1) {
      this.logger.warn('Cannot rotate key: only one API key available');
      return false;
    }

    const previousIndex = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    
    this.logger.info('API key rotated', { 
      from: previousIndex, 
      to: this.currentKeyIndex,
      totalKeys: this.apiKeys.length
    });

    return true;
  }

  async executeWithRetry(operation) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Try rotating key if available
        if (this.shouldRotateKey(error)) {
          await this.rotateKey();
        }

        // Calculate delay for exponential backoff
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(this.backoffMultiplier, attempt);
          this.logger.warn('Retrying API request', { 
            attempt: attempt + 1, 
            maxRetries: this.maxRetries,
            delay,
            error: error.message 
          });
          
          await this.sleep(delay);
        }
      }
    }

    throw new ApiException(`API request failed after ${this.maxRetries + 1} attempts: ${lastError.message}`);
  }

  isRetryableError(error) {
    const retryableErrors = [
      'rate limit',
      'quota exceeded',
      'timeout',
      'network error',
      'service unavailable',
      '429',
      '500',
      '502',
      '503',
      '504'
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError)
    );
  }

  shouldRotateKey(error) {
    const rotationTriggers = [
      'rate limit',
      'quota exceeded',
      '429'
    ];

    const errorMessage = error.message.toLowerCase();
    return rotationTriggers.some(trigger => 
      errorMessage.includes(trigger)
    );
  }

  async validateAllKeys() {
    const results = [];
    
    for (let i = 0; i < this.apiKeys.length; i++) {
      try {
        const client = this.clients.get(i);
        const model = client.getGenerativeModel({ 
          model: this.config.get('gemini.model', 'gemini-1.5-flash') 
        });
        
        const result = await model.generateContent({
          contents: [{ parts: [{ text: 'Test connection' }] }]
        });
        
        results.push({
          index: i,
          valid: true,
          response: result.response.text().substring(0, 50)
        });
      } catch (error) {
        results.push({
          index: i,
          valid: false,
          error: error.message
        });
      }
    }

    this.logger.info('API key validation completed', { 
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length
    });

    return results;
  }

  getStats() {
    return {
      totalKeys: this.apiKeys.length,
      currentKeyIndex: this.currentKeyIndex,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      model: this.config.get('gemini.model', 'gemini-1.5-flash')
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}