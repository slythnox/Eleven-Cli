import { Command } from 'commander';
import pkg from '../package.json' assert { type: 'json' };
import { configCommand } from './commands/config.js';
import { askCommand } from './commands/ask.js';
import { chatCommand } from './commands/chat.js';
import { fixCommand } from './commands/fix.js';

const program = new Command();

program
  .name('el')
  .version(pkg.version)
  .description('Eleven CLI - Gemini-powered assistant');

program.addCommand(configCommand());
program.addCommand(askCommand());
program.addCommand(chatCommand());
program.addCommand(fixCommand());

program.parse(process.argv);
