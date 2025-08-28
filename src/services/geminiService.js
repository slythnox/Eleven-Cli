import { GenerativeAI } from '@google/generative-ai';
import retry from 'retry';
import { loadConfig } from '../config/configManager.js';

class GeminiService {
  constructor() {
    this.cfg = loadConfig();
    this.client = null;
    this.keys = this.cfg.apiKeys || [];
    this.keyIndex = 0;
    this.model = this.cfg.model || 'gemini-1.5-flash';
    this._initClient();
  }

  _initClient() {
    const key = this._getKey();
    if (!key) throw new Error('No API key configured. Run `el config` to set one.');
    // Official SDK supports passing apiKey in constructor.
    this.client = new GenerativeAI({ apiKey: key });
  }

  _getKey() {
    if (!this.keys || this.keys.length === 0) return null;
    const key = this.keys[this.keyIndex % this.keys.length];
    return key;
  }

  rotateKey() {
    if (!this.cfg.rotate) return;
    this.keyIndex = (this.keyIndex + 1) % Math.max(1, this.keys.length);
    this._initClient();
  }

  async _withRetry(fn, opts = {}) {
    const operation = retry.operation({ retries: 3, factor: 2, minTimeout: 500, ...opts });
    return new Promise((resolve, reject) => {
      operation.attempt(async (currentAttempt) => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          // rotate on certain errors (rate limit / quota)
          const msg = (err && err.message) ? err.message.toLowerCase() : '';
          if (msg.includes('quota') || msg.includes('rate limit') || err.status === 429) {
            this.rotateKey();
          }
          if (!operation.retry(err)) {
            reject(operation.mainError());
          }
        }
      });
    });
  }

  async generateText(prompt, opts = {}) {
    return this._withRetry(async () => {
      const response = await this.client.generateContent({
        model: this.model,
        prompt: { text: prompt },
        maxOutputTokens: opts.maxTokens || this.cfg.tokens || 2048,
        temperature: opts.temp ?? this.cfg.temp ?? 0.2
      });
      // Response shape per SDK: response.output[0].content[0].text or similar.
      // Normalize defensively:
      if (response?.candidates?.length) return response.candidates.map(c => c.output).join('\n');
      if (response?.output?.length) return response.output.map(o => o.content?.map(c => c.text || '').join('')).join('\n');
      return JSON.stringify(response);
    });
  }

  // Chat method that accepts history array [{role:'system'|'user'|'assistant', content:'...'}]
  async chatGenerate(history, opts = {}) {
    return this._withRetry(async () => {
      const response = await this.client.generateContent({
        model: this.model,
        prompt: { messages: history },
        maxOutputTokens: opts.maxTokens || this.cfg.tokens || 2048,
        temperature: opts.temp ?? this.cfg.temp ?? 0.2
      });
      if (response?.candidates?.length) return response.candidates[0].output;
      return JSON.stringify(response);
    });
  }
}

export const gemini = new GeminiService();
