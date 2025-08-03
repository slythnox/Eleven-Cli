// src/config/settings.js
const fs = require("fs");
const path = require("path");
const os = require("os");

const CONFIG_DIR = path.join(os.homedir(), ".eleven-cli");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const BACKUP_FILE = path.join(CONFIG_DIR, "config.backup.json");

class Settings {
  constructor() {
    this.ensureConfigDir();
  }

  ensureConfigDir() {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }
    } catch (error) {
      throw new Error(`Cannot create config directory: ${error.message}`);
    }
  }

  getConfigPath() {
    return CONFIG_FILE;
  }

  getConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const configData = fs.readFileSync(CONFIG_FILE, "utf8");
        const config = JSON.parse(configData);
        
        // Ensure all required properties exist with defaults
        return {
          apiKey: null,
          apiKeys: [],
          useRotation: false,
          currentKeyIndex: 0,
          model: "gemini-1.5-flash",
          maxTokens: 8192,
          temperature: 0.7,
          lastUsed: Date.now(),
          version: "1.0.0",
          ...config
        };
      }
    } catch (error) {
      console.error(`Error reading config file: ${error.message}`);
      // Try to restore from backup
      if (fs.existsSync(BACKUP_FILE)) {
        try {
          console.log("Attempting to restore from backup...");
          const backupData = fs.readFileSync(BACKUP_FILE, "utf8");
          const backupConfig = JSON.parse(backupData);
          this.setConfig(backupConfig);
          return backupConfig;
        } catch (backupError) {
          console.error("Backup restoration failed:", backupError.message);
        }
      }
    }

    // Return default configuration
    return {
      apiKey: null,
      apiKeys: [],
      useRotation: false,
      currentKeyIndex: 0,
      model: "gemini-1.5-flash",
      maxTokens: 8192,
      temperature: 0.7,
      lastUsed: Date.now(),
      version: "1.0.0",
    };
  }

  setConfig(newConfig) {
    try {
      const currentConfig = this.getConfig();
      const updatedConfig = { 
        ...currentConfig, 
        ...newConfig,
        lastUpdated: Date.now()
      };

      // Create backup before saving
      this.createBackup(currentConfig);

      // Validate configuration
      this.validateConfig(updatedConfig);

      // Write new configuration
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
      return updatedConfig;
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error.message}`);
    }
  }

  createBackup(config) {
    try {
      if (config && Object.keys(config).length > 0) {
        fs.writeFileSync(BACKUP_FILE, JSON.stringify(config, null, 2));
      }
    } catch (error) {
      console.warn(`Failed to create backup: ${error.message}`);
    }
  }

  validateConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid configuration object');
    }

    // Validate API key format if present
    if (config.apiKey && !this.validateApiKeyFormat(config.apiKey)) {
      throw new Error('Invalid API key format');
    }

    // Validate additional API keys
    if (config.apiKeys && Array.isArray(config.apiKeys)) {
      for (const key of config.apiKeys) {
        if (!this.validateApiKeyFormat(key)) {
          throw new Error('Invalid API key format in additional keys');
        }
      }
    }

    // Validate numeric values
    if (config.maxTokens && (isNaN(config.maxTokens) || config.maxTokens < 1)) {
      throw new Error('Invalid maxTokens value');
    }

    if (config.temperature && (isNaN(config.temperature) || config.temperature < 0 || config.temperature > 2)) {
      throw new Error('Invalid temperature value (must be between 0 and 2)');
    }
  }

  validateApiKeyFormat(apiKey) {
    return apiKey && 
           typeof apiKey === 'string' && 
           apiKey.length > 20 && 
           apiKey.startsWith("AI");
  }

  getApiKey() {
    const config = this.getConfig();

    // Use rotation if enabled and multiple keys available
    if (config.useRotation && config.apiKeys && config.apiKeys.length > 0) {
      const currentKey = config.apiKeys[config.currentKeyIndex % config.apiKeys.length];
      if (currentKey) {
        return currentKey;
      }
    }

    // Fall back to primary API key or environment variable
    return config.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  }

  setApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new Error('API key cannot be empty');
    }

    const trimmedKey = apiKey.trim();
    if (!this.validateApiKeyFormat(trimmedKey)) {
      throw new Error('Invalid API key format. Gemini API keys should start with "AI"');
    }

    return this.setConfig({ apiKey: trimmedKey });
  }

  addApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new Error('API key cannot be empty');
    }

    const trimmedKey = apiKey.trim();
    if (!this.validateApiKeyFormat(trimmedKey)) {
      throw new Error('Invalid API key format. Gemini API keys should start with "AI"');
    }

    const config = this.getConfig();
    const apiKeys = config.apiKeys || [];

    if (!apiKeys.includes(trimmedKey)) {
      apiKeys.push(trimmedKey);
      return this.setConfig({ apiKeys });
    }

    throw new Error('API key already exists in rotation');
  }

  removeApiKey(apiKey) {
    const config = this.getConfig();
    const apiKeys = config.apiKeys || [];
    const filteredKeys = apiKeys.filter(key => key !== apiKey);
    
    if (filteredKeys.length === apiKeys.length) {
      throw new Error('API key not found in rotation');
    }

    return this.setConfig({ 
      apiKeys: filteredKeys,
      currentKeyIndex: 0 // Reset to first key
    });
  }

  rotateApiKey() {
    const config = this.getConfig();
    if (config.apiKeys && config.apiKeys.length > 1) {
      const newIndex = (config.currentKeyIndex + 1) % config.apiKeys.length;
      return this.setConfig({ currentKeyIndex: newIndex });
    }
    return config;
  }

  toggleRotation() {
    const config = this.getConfig();
    return this.setConfig({ useRotation: !config.useRotation });
  }

  // Advanced configuration methods
  updateModelSettings(model, maxTokens, temperature) {
    const updates = {};
    
    if (model) updates.model = model;
    if (maxTokens !== undefined) updates.maxTokens = maxTokens;
    if (temperature !== undefined) updates.temperature = temperature;

    return this.setConfig(updates);
  }

  resetToDefaults() {
    const defaultConfig = {
      apiKey: null,
      apiKeys: [],
      useRotation: false,
      currentKeyIndex: 0,
      model: "gemini-1.5-flash",
      maxTokens: 8192,
      temperature: 0.7,
      lastUsed: Date.now(),
      version: "1.0.0",
    };

    return this.setConfig(defaultConfig);
  }

  exportConfig() {
    const config = this.getConfig();
    // Remove sensitive data for export
    const exportConfig = { ...config };
    delete exportConfig.apiKey;
    delete exportConfig.apiKeys;
    return exportConfig;
  }

  // Get usage statistics
  getUsageStats() {
    const config = this.getConfig();
    return {
      lastUsed: config.lastUsed,
      lastUpdated: config.lastUpdated,
      apiKeysCount: (config.apiKeys || []).length,
      rotationEnabled: config.useRotation,
      model: config.model
    };
  }
}

module.exports = new Settings();
