import { Command } from 'commander';
import prompts from 'prompts';
import { loadConfig, saveConfig } from '../config/configManager.js';
import chalk from 'chalk';

export function configCommand() {
  const cmd = new Command('config');
  cmd
    .description('Configure API keys and settings')
    .option('-k, --key <key>', 'Set primary API key')
    .option('-a, --add <key>', 'Add API key for rotation')
    .option('-r, --rotate', 'Enable key rotation')
    .option('--show', 'Show current config');

  cmd.action(async (opts) => {
    const cfg = loadConfig();
    if (opts.show) {
      console.log(chalk.green('Current config:'), cfg);
      return;
    }

    if (opts.key) {
      cfg.apiKeys = [opts.key];
      saveConfig(cfg);
      console.log(chalk.green('Primary key set.'));
      return;
    }

    if (opts.add) {
      cfg.apiKeys = cfg.apiKeys || [];
      cfg.apiKeys.push(opts.add);
      saveConfig(cfg);
      console.log(chalk.green('Added API key.'));
      return;
    }

    if (opts.rotate) {
      cfg.rotate = true;
      saveConfig(cfg);
      console.log(chalk.green('Key rotation enabled.'));
      return;
    }

    // interactive if no flags
    const resp = await prompts([
      { type: 'text', name: 'key', message: 'Paste your primary Gemini API key (or blank to skip):' },
      { type: 'confirm', name: 'rotate', message: 'Enable rotation when multiple keys exist?', initial: cfg.rotate || false }
    ]);
    if (resp.key) {
      cfg.apiKeys = cfg.apiKeys || [];
      cfg.apiKeys[0] = resp.key;
    }
    cfg.rotate = resp.rotate;
    saveConfig(cfg);
    console.log(chalk.green('Saved config.'));
  });

  return cmd;
}
