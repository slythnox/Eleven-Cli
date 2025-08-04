const geminiService = require('../services/gemini');
const chalk = require('chalk');
const ora = require('ora');

const presets = {
  '/help': 'Show all available preset commands',
  '/about': 'Learn about Eleven AI assistant',
  '/write': 'Write code, scripts, or documentation',
  '/explain': 'Explain concepts, code, or technologies',
  '/suggest': 'Get suggestions and recommendations',
  '/modify': 'Modify existing code or content',
  '/debug': 'Debug code issues and problems',
  '/optimize': 'Optimize code for performance',
  '/review': 'Review code for best practices',
  '/learn': 'Learn about programming concepts',
  '/fix': 'Fix bugs and issues in code',
  '/create': 'Create new projects or components',
  '/analyze': 'Analyze code or data structures'
};

async function handlePresets(command, additionalPrompt = '') {
  try {
    if (command === '/help') {
      showPresetHelp();
      return;
    }

    if (command === '/about') {
      showAbout();
      return;
    }

    // Handle preset commands
    const baseCommand = command.split(' ')[0];
    if (!presets[baseCommand]) {
      console.log(chalk.red(`Unknown preset command: ${command}`));
      console.log(chalk.yellow('Use "/help" to see available commands'));
      return;
    }

    // Build the full prompt
    let fullPrompt = '';
    const commandText = command.substring(1); // Remove the '/' prefix
    
    if (additionalPrompt) {
      fullPrompt = `${commandText} ${additionalPrompt}`;
    } else {
      fullPrompt = commandText;
    }

    const spinner = ora('Processing your request...').start();

    try {
      console.log('Calling Gemini service with prompt:', fullPrompt.substring(0, 100) + '...');
      const response = await geminiService.generateResponse(fullPrompt);
      spinner.stop();

      console.log(chalk.blue('\n🤖 Eleven:'));
      console.log(response);
      console.log('');
    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
      console.error('Full error details:', error);
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        console.log(chalk.yellow('\n💡 Tip: Add more API keys to avoid rate limits:'));
        console.log(chalk.gray('el config -a YOUR_ADDITIONAL_KEY'));
        console.log(chalk.gray('el config -r  # Enable rotation'));
      }
    }
  } catch (error) {
    console.error(chalk.red(`Preset command error: ${error.message}`));
  }
}

function showPresetHelp() {
  console.log(chalk.green('\n🚀 Eleven Preset Commands'));
  console.log(chalk.gray('═'.repeat(50)));
  
  Object.entries(presets).forEach(([command, description]) => {
    console.log(`${chalk.cyan(command.padEnd(12))} ${chalk.gray(description)}`);
  });

  console.log(chalk.yellow('\n📝 Usage Examples:'));
  console.log(chalk.gray('  el /write a Python web scraper'));
  console.log(chalk.gray('  el /explain what is machine learning'));
  console.log(chalk.gray('  el /debug why my loop is infinite'));
  console.log(chalk.gray('  el /optimize this sorting algorithm'));
  console.log(chalk.gray('  el /review my JavaScript function'));
  
  console.log(chalk.yellow('\n💡 Pro Tips:'));
  console.log(chalk.gray('  • Use preset commands for quick actions'));
  console.log(chalk.gray('  • Combine with file operations: el /fix myfile.js'));
  console.log(chalk.gray('  • Add detailed descriptions for better results'));
}

function showAbout() {
  console.log(chalk.green('\n🤖 About Eleven'));
  console.log(chalk.gray('═'.repeat(30)));
  console.log(chalk.cyan('Eleven') + chalk.gray(' is your personal AI assistant, created specifically for Slythnox.'));
  console.log('');
  console.log(chalk.yellow('✨ Features:'));
  console.log(chalk.gray('  • Interactive chat sessions'));
  console.log(chalk.gray('  • Code generation and analysis'));
  console.log(chalk.gray('  • File modification and fixing'));
  console.log(chalk.gray('  • Preset commands for quick actions'));
  console.log(chalk.gray('  • API key rotation for rate limit management'));
  console.log(chalk.gray('  • VS Code integration'));
  console.log('');
  console.log(chalk.yellow('🔧 Powered by:'));
  console.log(chalk.gray('  • Google Gemini AI'));
  console.log(chalk.gray('  • Node.js & Commander.js'));
  console.log(chalk.gray('  • Made with ❤️ by Slythnox'));
  console.log('');
  console.log(chalk.gray('Version: 1.0.0'));
  console.log(chalk.gray('Use "el --help" for command reference'));
}

module.exports = { handlePresets };