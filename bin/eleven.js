#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const chalk = require('chalk');

// Ensure we can find the src directory
const srcPath = path.join(__dirname, '..', 'src');

let handleChat, handleConfig, handleCode, handlePresets, handleVSCode, showWelcome;

try {
  ({ handleChat } = require(path.join(srcPath, 'commands', 'chat')));
  ({ handleConfig } = require(path.join(srcPath, 'commands', 'config')));
  ({ handleCode } = require(path.join(srcPath, 'commands', 'code')));
  ({ handlePresets } = require(path.join(srcPath, 'commands', 'presets')));
  ({ handleVSCode } = require(path.join(srcPath, 'commands', 'vscode')));
  ({ showWelcome } = require(path.join(srcPath, 'utils', 'welcome')));
} catch (error) {
  console.error(chalk.red('❌ Failed to load required modules:'), error.message);
  console.log(chalk.yellow('💡 Try running: npm install'));
  process.exit(1);
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Unexpected error:'), error.message);
  console.log(chalk.yellow('💡 Try running: el config --show'));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled promise rejection:'), reason);
  console.log(chalk.yellow('💡 If this persists, please report it as a bug'));
  process.exit(1);
});

program
  .name('el')
  .description('Eleven - Your Personal AI Assistant CLI')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--no-welcome', 'Skip welcome message');

// Get command line arguments
const args = process.argv.slice(2);

// Handle preset commands first (commands starting with /)
if (args.length > 0 && args[0].startsWith('/')) {
  if (!program.opts().noWelcome) showWelcome();
  handlePresets(args[0], args.slice(1).join(' '));
  process.exit(0);
}

// Define all commands
program
  .command('chat')
  .description('Start an interactive chat session with Eleven')
  .option('-m, --message <message>', 'Send a single message')
  .option('-f, --file <file>', 'Include a file in the conversation')
  .option('-s, --stream', 'Enable streaming responses (default)')
  .action(async (options) => {
    if (!program.opts().noWelcome) showWelcome();
    try {
      await handleChat(options);
    } catch (error) {
      console.error(chalk.red(`❌ Chat error: ${error.message}`));
      if (error.message.includes('API key')) {
        console.log(chalk.yellow('💡 Run: el config'));
      }
      process.exit(1);
    }
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
  .option('--no-backup', 'Skip creating backup')
  .option('--preview', 'Preview changes without applying')
  .argument('[prompt]', 'Code generation or modification prompt')
  .action(async (prompt, options) => {
    if (!program.opts().noWelcome) showWelcome();
    try {
      await handleCode(prompt, options);
    } catch (error) {
      console.error(chalk.red(`❌ Code command error: ${error.message}`));
      if (error.message.includes('API key')) {
        console.log(chalk.yellow('💡 Run: el config'));
      }
      process.exit(1);
    }
  });

program
  .command('fix')
  .description('Fix code issues in a file')
  .argument('<file>', 'File to fix')
  .argument('[description]', 'Description of what to fix')
  .option('--preview', 'Preview changes without applying')
  .option('--no-backup', 'Skip creating backup')
  .action(async (file, description, options) => {
    if (!program.opts().noWelcome) showWelcome();
    try {
      const prompt = description || 'fix any issues, bugs, or improvements';
      await handleCode(prompt, { file, fix: true, ...options });
    } catch (error) {
      console.error(chalk.red(`❌ Fix command error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('rewrite')
  .description('Completely rewrite a code file')
  .argument('<file>', 'File to rewrite')
  .argument('[requirements]', 'Requirements for the rewrite')
  .option('--preview', 'Preview changes without applying')
  .option('--no-backup', 'Skip creating backup')
  .action(async (file, requirements, options) => {
    if (!program.opts().noWelcome) showWelcome();
    try {
      const prompt = requirements || 'rewrite this code with best practices and improvements';
      await handleCode(prompt, { file, rewrite: true, ...options });
    } catch (error) {
      console.error(chalk.red(`❌ Rewrite command error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('vscode')
  .description('VS Code integration setup and management')
  .option('--setup', 'Setup VS Code integration')
  .option('--check', 'Check VS Code availability')
  .option('--path <path>', 'Workspace path for setup')
  .option('--diff', 'Show diff view')
  .option('-f, --file <file>', 'File for diff view')
  .action(async (options) => {
    if (!program.opts().noWelcome) showWelcome();
    try {
      await handleVSCode(options);
    } catch (error) {
      console.error(chalk.red(`❌ VS Code command error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Configure API key and settings')
  .option('-k, --key <apikey>', 'Set API key')
  .option('-a, --add-key <apikey>', 'Add additional API key for rotation')
  .option('-s, --show', 'Show current configuration')
  .option('-r, --rotation', 'Toggle API key rotation')
  .option('--reset', 'Reset configuration to defaults')
  .option('--export', 'Export configuration (without API keys)')
  .option('--model <model>', 'Set AI model (gemini-1.5-flash, gemini-1.5-pro)')
  .option('--temp <temperature>', 'Set temperature (0.0-2.0)')
  .option('--tokens <maxTokens>', 'Set max tokens')
  .action(async (options) => {
    if (!program.opts().noWelcome) showWelcome();
    try {
      await handleConfig(options);
    } catch (error) {
      console.error(chalk.red(`❌ Config error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('ask')
  .description('Ask a quick question')
  .argument('<question>', 'Your question')
  .option('-f, --file <file>', 'Include file context')
  .action(async (question, options) => {
    if (!program.opts().noWelcome) showWelcome();
    try {
      await handleChat({ message: question, ...options });
    } catch (error) {
      console.error(chalk.red(`❌ Ask command error: ${error.message}`));
      if (error.message.includes('API key')) {
        console.log(chalk.yellow('💡 Run: el config'));
      }
      process.exit(1);
    }
  });

// Health check command
program
  .command('health')
  .description('Check system health and API connectivity')
  .action(async () => {
    if (!program.opts().noWelcome) showWelcome();
    
    console.log(chalk.blue('🔍 Running health checks...\n'));
    
    try {
      const settings = require(path.join(srcPath, 'config', 'settings'));
      const geminiService = require(path.join(srcPath, 'services', 'gemini'));
      
      // Check config
      console.log(chalk.cyan('📋 Configuration:'));
      const config = settings.getConfig();
      console.log(`   API Key: ${config.apiKey ? '✅ Set' : '❌ Missing'}`);
      console.log(`   Config File: ${settings.getConfigPath()}`);
      
      // Check API connectivity
      console.log(chalk.cyan('\n🔗 API Connectivity:'));
      try {
        const isHealthy = await geminiService.healthCheck();
        console.log(`   Gemini API: ${isHealthy ? '✅ Connected' : '❌ Failed'}`);
      } catch (error) {
        console.log(`   Gemini API: ❌ ${error.message}`);
      }
      
      // Check dependencies
      console.log(chalk.cyan('\n📦 Dependencies:'));
      const dependencies = ['@google/generative-ai', 'chalk', 'commander', 'inquirer', 'ora'];
      dependencies.forEach(dep => {
        try {
          require(dep);
          console.log(`   ${dep}: ✅ Available`);
        } catch {
          console.log(`   ${dep}: ❌ Missing`);
        }
      });
      
      console.log(chalk.green('\n✅ Health check complete!'));
      
    } catch (error) {
      console.error(chalk.red(`❌ Health check failed: ${error.message}`));
      process.exit(1);
    }
  });

// Handle direct commands (not preset commands starting with /)
if (args.length > 0) {
  const commandExists = ['chat', 'code', 'config', 'ask', 'fix', 'rewrite', 'vscode', 'health', '--help', '-h', '--version', '-V'].includes(args[0]);
  
  if (!commandExists) {
    // This is a direct chat command
    if (!program.opts().noWelcome) showWelcome();
    
    const fullPrompt = args.join(' ');
    
    // Check if this looks like a file operation
    const filePattern = /\.(js|ts|py|java|cpp|c|cs|php|rb|go|rs|swift|kt|html|css|json|md|txt|jsx|tsx|vue|svelte)$/i;
    const hasFile = args.some(arg => filePattern.test(arg));
    
    (async () => {
      try {
        if (hasFile) {
          // Try to detect file operations
          const fileArg = args.find(arg => filePattern.test(arg));
          const remainingArgs = args.filter(arg => arg !== fileArg);
          
          if (remainingArgs.some(arg => ['fix', 'rewrite', 'modify', 'improve', 'optimize', 'debug'].includes(arg.toLowerCase()))) {
            // This looks like a file modification command
            await handleCode(remainingArgs.join(' '), { file: fileArg, modify: true });
          } else {
            // Regular chat with file context
            await handleChat({ message: fullPrompt });
          }
        } else {
          await handleChat({ message: fullPrompt });
        }
      } catch (error) {
        console.error(chalk.red(`❌ Command error: ${error.message}`));
        if (error.message.includes('API key')) {
          console.log(chalk.yellow('💡 Run: el config'));
        }
        process.exit(1);
      }
    })();
    
    // Exit to prevent continuing to parse
    return;
  }
}

// Handle unknown commands
program.on('command:*', function (operands) {
  console.log(chalk.red(`❌ Unknown command: ${operands[0]}`));
  console.log(chalk.yellow('📖 Run "el --help" to see available commands'));
  console.log(chalk.gray('\n🚀 Quick commands:'));
  console.log(chalk.gray('  el ask "your question"          - Ask a quick question'));
  console.log(chalk.gray('  el fix <file> [description]     - Fix issues in a file'));
  console.log(chalk.gray('  el rewrite <file> [requirements] - Rewrite a file'));
  console.log(chalk.gray('  el code -o <file> "prompt"      - Generate code to file'));
  console.log(chalk.gray('  el config                       - Setup API key'));
  console.log(chalk.gray('  el health                       - Check system health'));
  console.log(chalk.gray('  el vscode --setup               - Setup VS Code integration'));
  process.exit(1);
});

// Enhanced help display
if (process.argv.length <= 2) {
  if (!program.opts().noWelcome) showWelcome();
  
  console.log(chalk.green('🚀 Quick Start Guide:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log('');
  
  // Check if configured
  try {
    const settings = require(path.join(srcPath, 'config', 'settings'));
    const config = settings.getConfig();
    
    if (!config.apiKey) {
      console.log(chalk.yellow('⚡ First time setup:'));
      console.log(chalk.gray('   1. Get API key: https://makersuite.google.com/app/apikey'));
      console.log(chalk.gray('   2. Run: el config'));
      console.log(chalk.gray('   3. Start chatting: el ask "Hello!"'));
      console.log('');
    } else {
      console.log(chalk.green('✅ Eleven is configured and ready!'));
      console.log('');
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Configuration check failed. Run: el config'));
    console.log('');
  }
  
  console.log(chalk.cyan('💬 Chat & Ask:'));
  console.log(chalk.gray('   el ask "What is machine learning?"'));
  console.log(chalk.gray('   el chat                          # Interactive session'));
  console.log('');
  
  console.log(chalk.cyan('💻 Code Operations:'));
  console.log(chalk.gray('   el fix myfile.js                 # Fix issues'));
  console.log(chalk.gray('   el rewrite myfile.js "make async" # Rewrite with requirements'));
  console.log(chalk.gray('   el code -o newfile.js "REST API" # Generate new code'));
  console.log('');
  
  console.log(chalk.cyan('⚙️  Configuration:'));
  console.log(chalk.gray('   el config                        # Setup/manage API keys'));
  console.log(chalk.gray('   el config --show                 # View current settings'));
  console.log(chalk.gray('   el health                        # Check system health'));
  console.log('');
  
  console.log(chalk.cyan('🎯 Preset Commands:'));
  console.log(chalk.gray('   el /write a Python web scraper'));
  console.log(chalk.gray('   el /explain machine learning'));
  console.log(chalk.gray('   el /debug my infinite loop'));
  console.log(chalk.gray('   el /help                         # See all presets'));
  console.log('');
  
  console.log(chalk.yellow('🆕 New Features:'));
  console.log(chalk.gray('   • Health check command: el health'));
  console.log(chalk.gray('   • Enhanced error handling and recovery'));
  console.log(chalk.gray('   • Configuration backup and validation'));
  console.log(chalk.gray('   • VS Code integration: el vscode --setup'));
  console.log(chalk.gray('   • API key rotation for rate limits'));
  console.log('');
  
  console.log(chalk.gray('For detailed help: el --help'));
  console.log('');
  
  // Don't parse if just showing help
  return;
}

// Parse command line arguments
try {
  program.parse();
} catch (error) {
  console.error(chalk.red(`❌ Command parsing error: ${error.message}`));
  console.log(chalk.yellow('💡 Try: el --help'));
  process.exit(1);
}
