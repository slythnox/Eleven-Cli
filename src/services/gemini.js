const { GoogleGenerativeAI } = require('@google/generative-ai');
const settings = require('../config/settings');
const chalk = require('chalk');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.requestCount = 0;
    this.lastResetTime = Date.now();
  }

  initialize() {
    const apiKey = settings.getApiKey();
    
    if (!apiKey) {
      throw new Error('API key not found. Please set it using: eleven config -k YOUR_API_KEY');
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
  async generateResponse(prompt, options = {}) {
    try {
      this.checkRateLimit();
      
      if (!this.model) {
        this.initialize();
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (error.message.includes('API_KEY')) {
        throw new Error('Invalid API key. Please check your Gemini API key.');
      }
      if (error.message.includes('quota') || error.message.includes('rate')) {
        const config = settings.getConfig();
        if (config.useRotation && config.apiKeys && config.apiKeys.length > 1) {
          console.log(chalk.yellow('🔄 Rate limit hit, rotating API key...'));
          settings.rotateApiKey();
          this.initialize();
          return this.generateResponse(prompt, options); // Retry with new key
        }
        throw new Error('Rate limit exceeded. Consider adding more API keys for rotation.');
      }
      throw error;
    }
  }

  async generateStreamResponse(prompt, onChunk) {
    try {
      this.checkRateLimit();
      
      if (!this.model) {
        this.initialize();
      }

      const result = await this.model.generateContentStream(prompt);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          onChunk(chunkText);
        }
      }
    } catch (error) {
      if (error.message.includes('API_KEY')) {
        throw new Error('Invalid API key. Please check your Gemini API key.');
      }
      if (error.message.includes('quota') || error.message.includes('rate')) {
        const config = settings.getConfig();
        if (config.useRotation && config.apiKeys && config.apiKeys.length > 1) {
          console.log(chalk.yellow('🔄 Rate limit hit, rotating API key...'));
          settings.rotateApiKey();
          this.initialize();
          return this.generateStreamResponse(prompt, onChunk); // Retry with new key
        }
        throw new Error('Rate limit exceeded. Consider adding more API keys for rotation.');
      }
      throw error;
    }
  }
}

module.exports = new GeminiService();