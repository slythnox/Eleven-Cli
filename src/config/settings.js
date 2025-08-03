const fs = require("fs");
const path = require("path");
const os = require("os");

const CONFIG_DIR = path.join(os.homedir(), ".eleven-cli");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

class Settings {
  constructor() {
    this.ensureConfigDir();
  }

  ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  getConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
        // Ensure all required properties exist
        return {
          apiKey: null,
          apiKeys: [],
          useRotation: false,
          currentKeyIndex: 0,
          model: "gemini-1.5-flash",
          maxTokens: 8192,
          temperature: 0.7,
          ...config
        };
      }
    } catch (error) {
      console.error("Error reading config file:", error.message);
    }

    return {
      apiKey: null,
      apiKeys: [],
      useRotation: false,
      currentKeyIndex: 0,
      model: "gemini-1.5-flash",
      maxTokens: 8192,
      temperature: 0.7,
    };
  }

  setConfig(newConfig) {
    try {
      const currentConfig = this.getConfig();
      const updatedConfig = { ...currentConfig, ...newConfig };

      fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
      return updatedConfig;
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error.message}`);
    }
  }

  getApiKey() {
    const config = this.getConfig();

    // Use rotation if enabled and multiple keys available
    if (config.useRotation && config.apiKeys && config.apiKeys.length > 0) {
      return config.apiKeys[config.currentKeyIndex % config.apiKeys.length];
    }

    return config.apiKey || process.env.GEMINI_API_KEY;
  }

  setApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new Error('API key cannot be empty');
    }
    return this.setConfig({ apiKey });
  }

  addApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new Error('API key cannot be empty');
    }

    const config = this.getConfig();
    const apiKeys = config.apiKeys || [];

    if (!apiKeys.includes(apiKey)) {
      apiKeys.push(apiKey);
      return this.setConfig({ apiKeys });
    }

    return config;
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
}

module.exports = new Settings();
