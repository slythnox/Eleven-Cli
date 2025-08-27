import { GenerativeAI } from '@google/generative-ai';
import { ConfigManager } from '../utils/ConfigManager.js';
import { LoggingUtil } from '../utils/LoggingUtil.js';
import { ApiException } from '../exceptions/ApiException.js';

export class GeminiClient {
  constructor() {
    this.config = ConfigManager.getInstance();
    this.logger = LoggingUtil.getInstance();
    this.apiManager = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      const { ApiManager } = await import('./ApiManager.js');
      this.apiManager = new ApiManager();
      await this.apiManager.initialize();
      this.initialized = true;
      this.logger.info('Gemini client initialized');
    } catch (error) {
      throw new ApiException(`Failed to initialize Gemini client: ${error.message}`);
    }
  }

  async generateStructuredResponse(systemPrompt, userPrompt, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const model = await this.apiManager.getModel();
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'I understand. I will respond with structured JSON as specified.' }]
          }
        ],
        generationConfig: {
          temperature: options.temperature || 0.1,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxTokens || 2048,
        }
      });

      const result = await chat.sendMessage(userPrompt);
      const response = result.response;
      const text = response.text();

      this.logger.debug('Gemini API response received', {
        promptLength: userPrompt.length,
        responseLength: text.length
      });

      return text;
    } catch (error) {
      this.logger.error('Gemini API request failed', { error: error.message });
      
      // Handle specific API errors
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        await this.apiManager.rotateKey();
        throw new ApiException('Rate limit exceeded. Please try again in a moment.');
      }
      
      if (error.message.includes('API key')) {
        throw new ApiException('Invalid API key. Please check your configuration.');
      }
      
      throw new ApiException(`Gemini API error: ${error.message}`);
    }
  }

  async generateResponse(prompt, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const model = await this.apiManager.getModel();
      const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxTokens || 1024,
        }
      });

      const response = result.response;
      const text = response.text();

      this.logger.debug('Gemini API response received', {
        promptLength: prompt.length,
        responseLength: text.length
      });

      return text;
    } catch (error) {
      this.logger.error('Gemini API request failed', { error: error.message });
      throw new ApiException(`Gemini API error: ${error.message}`);
    }
  }

  async validateConnection() {
    try {
      const testResponse = await this.generateResponse('Hello, please respond with "Connection successful"');
      return testResponse.includes('Connection successful') || testResponse.includes('successful');
    } catch (error) {
      this.logger.error('Connection validation failed', { error: error.message });
      return false;
    }
  }
}