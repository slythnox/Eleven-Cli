import { Command } from 'commander';
import pkg from '../package.json' assert { type: 'json' };
import { configCommand } from './commands/config.js';
import { executeCommand } from './commands/execute.js';
import { planCommand } from './commands/plan.js';
import { validateCommand } from './commands/validate.js';
import { statusCommand } from './commands/status.js';

const program = new Command();

program
  .name('forge')
  .version(pkg.version)
  .description('Forge CLI - AI-powered command-line assistant for intelligent system control');

// Add commands
program.addCommand(configCommand());
program.addCommand(executeCommand());
program.addCommand(planCommand());
program.addCommand(validateCommand());
program.addCommand(statusCommand());

// Default command - execute natural language query
program
  .argument('[query...]', 'Natural language command to execute')
  .option('-p, --plan-only', 'Show execution plan without running commands')
  .option('-y, --auto-approve', 'Automatically approve all steps (use with caution)')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-c, --config <path>', 'Custom configuration file path')
  .action(async (query, options) => {
    if (query && query.length > 0) {
      const { handleExecute } = await import('./commands/execute.js');
      await handleExecute(query.join(' '), options);
    } else {
      program.help();
    }
  });

program.parse(process.argv);