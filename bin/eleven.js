#!/usr/bin/env node

const { program } = require('commander');
const { handleChat } = require('../src/commands/chat');
const { handleConfig } = require('../src/commands/config');
const { handleCode } = require('../src/commands/code');
const { handlePresets } = require('../src/commands/presets');
const { handleVSCode } = require('../src/commands/vscode');
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
  .description('Generate, analyze, or modify code')
  .option('-l, --language <language>', 'Specify programming language')
  .option('-f, --file <file>', 'Analyze or modify a code file')
  .option('-o, --output <file>', 'Output generated code to a file')
  .option('--fix', 'Fix issues in the specified file')
  .option('--rewrite', 'Completely rewrite the specified file')
  .option('--modify', 'Modify the specified file based on prompt')
  .option('--backup', 'Create backup before modifying (default: true)')
  .argument('[prompt]', 'Code generation or modification prompt')
  .action((prompt, options) => {
    showWelcome();
    handleCode(prompt, options);
  });

program
  .command('fix')
  .description('Fix code issues in a file')
  .argument('<file>', 'File to fix')
  .argument('[description]', 'Description of what to fix')
  .action(async (file, description) => {
    showWelcome();
    const prompt = description || 'fix any issues, bugs, or improvements';
    await handleCode(prompt, { file, fix: true });
  });

program
  .command('rewrite')
  .description('Completely rewrite a code file')
  .argument('<file>', 'File to rewrite')
  .argument('[requirements]', 'Requirements for the rewrite')
  .action(async (file, requirements) => {
    showWelcome();
    const prompt = requirements || 'rewrite this code with best practices and improvements';
    await handleCode(prompt, { file, rewrite: true });
  });

program
  .command('vscode')
  .description('VS Code integration setup and management')
  .option('--setup', 'Setup VS Code integration')
  .option('--check', 'Check VS Code availability')
  .option('--path <path>', 'Workspace path for setup')
  .option('--diff', 'Show diff view')
  .option('-f, --file <file>', 'File for diff view')
  .action((options) => {
    showWelcome();
    handleVSCode(options);
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

// Enhanced direct commands
if (args.length > 0 && !['chat', 'code', 'config', 'ask', 'fix', 'rewrite', '--help', '-h', '--version', '-V'].includes(args[0])) {
  showWelcome();
  const fullPrompt = args.join(' ');
  
  // Check if this looks like a file operation
  const filePattern = /\.(js|ts|py|java|cpp|c|cs|php|rb|go|rs|swift|kt|html|css|json)$/i;
  const hasFile = args.some(arg => filePattern.test(arg));
  
  if (hasFile) {
    // Try to detect file operations
    const fileArg = args.find(arg => filePattern.test(arg));
    const remainingArgs = args.filter(arg => arg !== fileArg);
    
    if (remainingArgs.some(arg => ['fix', 'rewrite', 'modify', 'improve'].includes(arg.toLowerCase()))) {
      // This looks like a file modification command
      handleCode(remainingArgs.join(' '), { file: fileArg, modify: true });
    } else {
      // Regular chat with file context
      handleChat({ message: fullPrompt });
    }
  } else {
    handleChat({ message: fullPrompt });
  }
  process.exit(0);
}

// Handle unknown commands
program.on('command:*', function (operands) {
  console.log(chalk.red(`Unknown command: ${operands[0]}`));
  console.log(chalk.yellow('Run "el --help" to see available commands'));
  console.log(chalk.gray('\nNew file modification commands:'));
  console.log(chalk.gray('  el fix <file> [description]     - Fix issues in a file'));
  console.log(chalk.gray('  el rewrite <file> [requirements] - Rewrite a file'));
  console.log(chalk.gray('  el code -f <file> --fix         - Fix file interactively'));
  console.log(chalk.gray('  el code -o <file> "prompt"      - Generate code to file'));
  console.log(chalk.gray('  el vscode --setup               - Setup VS Code integration'));
  process.exit(1);
});

// Show help if no command provided
if (process.argv.length <= 2) {
  showWelcome();
  console.log(chalk.green('🆕 New Features:'));
  console.log(chalk.gray('  • File modification: el fix myfile.js'));
  console.log(chalk.gray('  • Code rewriting: el rewrite myfile.js'));
  console.log(chalk.gray('  • Output to file: el code -o newfile.js "create a function"'));
  console.log(chalk.gray('  • VS Code integration: el vscode --setup'));
  console.log('');
  program.help();
}

program.parse();
