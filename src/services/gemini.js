const { GoogleGenerativeAI } = require('@google/generative-ai');
const settings = require('../config/settings');
const chalk = require('chalk');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  initialize() {
    const apiKey = settings.getApiKey();
    
    if (!apiKey) {
      throw new Error('API key not found. Please set it using: el config -k YOUR_API_KEY');
    }

    // Validate API key format
    if (!this.validateApiKey(apiKey)) {
      throw new Error('Invalid API key format. Please check your Gemini API key.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    const config = settings.getConfig();
    this.model = this.genAI.getGenerativeModel({ 
      model: config.model,
      generationConfig: {
        maxOutputTokens: config.maxTokens,
        temperature: config.temperature,
      }
    });
  }

  validateApiKey(apiKey) {
    // Basic validation for Gemini API key format
    return apiKey && apiKey.length > 20 && apiKey.startsWith('AI');
  }

  checkRateLimit() {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    // Reset counter every minute
    if (now - this.lastResetTime > oneMinute) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    // Check if we're approaching rate limit (14 requests per minute to be safe)
    if (this.requestCount >= 14) {
      const config = settings.getConfig();
      if (config.useRotation && config.apiKeys && config.apiKeys.length > 1) {
        console.log(chalk.yellow('🔄 Rotating API key to avoid rate limits...'));
        settings.rotateApiKey();
        this.initialize(); // Reinitialize with new key
        this.requestCount = 0; // Reset counter for new key
      } else {
        throw new Error('Rate limit approaching. Consider adding more API keys for rotation.');
      }
    }
    
    this.requestCount++;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retryWithBackoff(operation, attempt = 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw error;
      }
      
      const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(chalk.yellow(`⏳ Retrying in ${backoffTime/1000}s... (attempt ${attempt}/${this.maxRetries})`));
      await this.sleep(backoffTime);
      
      return this.retryWithBackoff(operation, attempt + 1);
    }
  }

  handleError(error) {
    if (error.message.includes('API_KEY') || error.message.includes('invalid')) {
      throw new Error('Invalid API key. Please check your Gemini API key with: el config -k YOUR_KEY');
    }
    
    if (error.message.includes('quota') || error.message.includes('rate') || error.message.includes('429')) {
      const config = settings.getConfig();
      if (config.useRotation && config.apiKeys && config.apiKeys.length > 1) {
        console.log(chalk.yellow('🔄 Rate limit hit, rotating API key...'));
        settings.rotateApiKey();
        this.initialize();
        throw new Error('RETRY_WITH_NEW_KEY'); // Special error for retry logic
      }
      throw new Error('Rate limit exceeded. Add more API keys: el config -a YOUR_SECOND_KEY');
    }
    
    if (error.message.includes('network') || error.message.includes('timeout') || error.code === 'ENOTFOUND') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    if (error.message.includes('SAFETY')) {
      throw new Error('Content was blocked for safety reasons. Please rephrase your request.');
    }
    
    // Generic error handling
    throw new Error(`AI service error: ${error.message}`);
  }

  async generateResponse(prompt, options = {}) {
    if (!this.model) {
      this.initialize();
    }

    return this.retryWithBackoff(async () => {
      try {
        this.checkRateLimit();
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        
        // Check if response was blocked
        if (!response.text()) {
          throw new Error('Response was blocked. Please try rephrasing your request.');
        }
        
        return response.text();
      } catch (error) {
        if (error.message === 'RETRY_WITH_NEW_KEY') {
          // Retry once with new key
          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          return response.text();
        }
        this.handleError(error);
      }
    });
  }

  async generateStreamResponse(prompt, onChunk) {
    if (!this.model) {
      this.initialize();
    }

    return this.retryWithBackoff(async () => {
      try {
        this.checkRateLimit();
        
        const result = await this.model.generateContentStream(prompt);
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            onChunk(chunkText);
          }
        }
      } catch (error) {
        if (error.message === 'RETRY_WITH_NEW_KEY') {
          // Retry once with new key
          const result = await this.model.generateContentStream(prompt);
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              onChunk(chunkText);
            }
          }
          return;
        }
        this.handleError(error);
      }
    });
  }

  // Health check method
  async healthCheck() {
    try {
      if (!this.model) {
        this.initialize();
      }
      
      const result = await this.model.generateContent('Hello');
      return result.response.text() ? true : false;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new GeminiService();
