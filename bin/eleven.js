#!/usr/bin/env node

const { program } = require('commander');
const { handleChat } = require('../src/commands/chat');
const { handleConfig } = require('../src/commands/config');
const { handleCode } = require('../src/commands/code');
const { handlePresets } = require('../src/commands/presets');
const { showWelcome } = require('../src/utils/welcome');
const chalk = require('chalk');

program
  .name('el')
  .description('Eleven - Personal AI assistant for Slythnox')
  .version('1.0.0');

// Handle preset commands first
const args = process.argv.slice(2);
if (args.length > 0 && args[0].startsWith('/')) {
  showWelcome();
  handlePresets(args[0], args.slice(1).join(' '));
  process.exit(0);
}

program
  .command('chat')
  .description('Start an interactive chat session with Eleven')
  .option('-m, --message <message>', 'Send a single message')
  .option('-f, --file <file>', 'Include a file in the conversation')
  .action((options) => {
    showWelcome();
    handleChat(options);
  });

program
  .command('code')
  .description('Generate or explain code')
  .option('-l, --language <language>', 'Specify programming language')
  .option('-f, --file <file>', 'Analyze a code file')
  .argument('[prompt]', 'Code generation prompt')
  .action((prompt, options) => {
    showWelcome();
    handleCode(prompt, options);
  });

program
  .command('config')
  .description('Configure API key and settings')
  .option('-k, --key <apikey>', 'Set API key')
  .option('-a, --add-key <apikey>', 'Add additional API key for rotation')
  .option('-s, --show', 'Show current configuration')
  .option('-r, --rotation', 'Toggle API key rotation')
  .action((options) => {
    showWelcome();
    handleConfig(options);
  });

program
  .command('ask')
  .description('Ask a quick question')
  .argument('<question>', 'Your question')
  .action(async (question) => {
    showWelcome();
    await handleChat({ message: question });
  });

// Handle direct commands without subcommands
if (args.length > 0 && !['chat', 'code', 'config', 'ask', '--help', '-h', '--version', '-V'].includes(args[0])) {
  showWelcome();
  const fullPrompt = args.join(' ');
  handleChat({ message: fullPrompt });
  process.exit(0);
}
// Handle unknown commands
program.on('command:*', function (operands) {
  console.log(chalk.red(`Unknown command: ${operands[0]}`));
  console.log(chalk.yellow('Run "el --help" to see available commands'));
  process.exit(1);
});

// Show help if no command provided
if (process.argv.length <= 2) {
  showWelcome();
  program.help();
}

program.parse();