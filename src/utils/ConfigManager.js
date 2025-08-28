import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export class ConfigManager {
  static instance = null;

  constructor() {
    this.configPath = path.join(os.homedir(), '.forge-cli', 'config.json');
    this.config = {};
    this.loaded = false;
  }

  static getInstance() {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async load() {
    try {
      await this.ensureConfigDir();
      
      if (await this.fileExists(this.configPath)) {
        const configData = await fs.readFile(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
      } else {
        this.config = this.getDefaultConfig();
        await this.save();
      }
      
      this.loaded = true;
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  async save() {
    try {
      await this.ensureConfigDir();
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error.message}`);
    }
  }

  get(key, defaultValue = null) {
    if (!this.loaded) {
      // Synchronously load config if not already loaded
      this.loadSync();
    }
    
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  set(key, value) {
    if (!this.loaded) {
      this.loadSync();
    }
    
    const keys = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    if (!this.loaded) {
      this.loadSync();
    }
    
    const keys = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        return false;
      }
      current = current[k];
    }
    
    delete current[keys[keys.length - 1]];
    return true;
  }

  getAll() {
    if (!this.loaded) {
      this.loadSync();
    }
    return { ...this.config };
  }

  reset() {
    this.config = this.getDefaultConfig();
    this.loaded = true;
  }

  loadSync() {
    try {
      const fs = require('fs');
      
      if (!fs.existsSync(path.dirname(this.configPath))) {
        fs.mkdirSync(path.dirname(this.configPath), { recursive: true });
      }
      
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
      } else {
        this.config = this.getDefaultConfig();
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      }
      
      this.loaded = true;
    } catch (error) {
      this.config = this.getDefaultConfig();
      this.loaded = true;
    }
  }

  async ensureConfigDir() {
    const configDir = path.dirname(this.configPath);
    try {
      await fs.mkdir(configDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getDefaultConfig() {
    return {
      gemini: {
        model: 'gemini-1.5-flash',
        apiKeys: '',
        timeout: 30000,
        maxRetries: 3
      },
      sandbox: {
        mode: 'subprocess',
        workdir: '/tmp/forge-work',
        timeout: 30000,
        maxMemoryMB: 512
      },
      security: {
        denylistFile: 'src/config/denylist.yaml',
        requireConfirmation: true,
        allowHighRisk: false
      },
      logging: {
        level: 'INFO',
        auditEnabled: true,
        auditDir: 'logs'
      }
    };
  }

  getConfigPath() {
    return this.configPath;
  }
}