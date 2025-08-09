import os from 'os';
import path from 'path';
import fs from 'fs-extra';

const CONFIG_PATH = path.join(os.homedir(), '.eleven-cli', 'config.json');

export function ensureConfigDir() {
  const dir = path.dirname(CONFIG_PATH);
  fs.ensureDirSync(dir);
}

export function loadConfig() {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_PATH)) return { apiKeys: [], rotate: false, model: 'gemini-1.5-flash', temp: 0.2, tokens: 2048 };
  return fs.readJsonSync(CONFIG_PATH);
}

export function saveConfig(cfg) {
  ensureConfigDir();
  fs.writeJsonSync(CONFIG_PATH, cfg, { spaces: 2 });
}
