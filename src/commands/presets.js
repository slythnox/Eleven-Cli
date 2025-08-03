const chalk = require('chalk');
const { handleChat } = require('./chat');
const { handleCode } = require('./code');

const presets = {
  '/help': {
    description: 'Show available preset commands',
    handler: () => showHelp()
  },
  '/about': {
    description: 'About Eleven CLI',
    handler: () => showAbout()
  },
  '/write': {
    description: 'Write code for a specific task',
    handler: (prompt) => handleCode(`Write clean, well-documented code for: ${prompt}`)
  },
  '/explain': {
    description: 'Explain code, concepts, or files',
    handler: (prompt) => handleChat({ message: `Please explain in detail: ${prompt}` })
  },
  '/suggest': {
    description: 'Get suggestions for code improvements',
    handler: (prompt) => handleChat({ message: `Please provide suggestions and improvements for: ${prompt}` })
  },
  '/modify': {
    description: 'Modify or refactor existing code',
    handler: (prompt) => handleChat({ message: `Please modify and improve this code: ${prompt}` })
  },
  '/debug': {
    description: 'Help debug code issues',
    handler: (prompt) => handleChat({ message: `Please help debug this issue: ${prompt}` })
  },
  '/optimize': {
    description: 'Optimize code for performance',
    handler: (prompt) => handleChat({ message: `Please optimize this code for better performance: ${prompt}` })
  },
  '/review': {
    description: 'Review code for best practices',
    handler: (prompt) => handleChat({ message: `Please review this code and suggest best practices: ${prompt}` })
  },
  '/learn': {
    description: 'Learn about programming concepts',
    handler: (prompt) => handleChat({ message: `Please teach me about: ${prompt}. Provide examples and explanations.` })
  }
};

function showHelp() {
  console.log(chalk.green('\n🚀 Eleven Preset Commands:'));
  console.log(chalk.gray('─'.repeat(50)));
  
  Object.entries(presets).forEach(([command, info]) => {
    console.log(`${chalk.cyan(command.padEnd(12))} ${chalk.gray(info.description)}`);
  });
  
  console.log(chalk.gray('\n📝 Usage Examples:'));
  console.log(chalk.yellow('  el /write a Python function to sort a list'));
  console.log(chalk.yellow('  el /explain what is recursion'));
  console.log(chalk.yellow('  el /suggest improvements for my React component'));
  console.log(chalk.yellow('  el /debug why my loop is infinite'));
  
  console.log(chalk.gray('\n💡 Direct Usage:'));
  console.log(chalk.yellow('  el write a REST API in Node.js'));
  console.log(chalk.yellow('  el how do I center a div in CSS?'));
  console.log(chalk.yellow('  el explain machine learning basics'));
}

function showAbout() {
  console.log(chalk.green('\n🤖 About Eleven'));
  console.log(chalk.gray('─'.repeat(30)));
  console.log(chalk.cyan('Name:'), 'Eleven - Personal AI Assistant');
  console.log(chalk.cyan('Creator:'), 'Slythnox');
  console.log(chalk.cyan('Version:'), '1.0.0');
  console.log(chalk.cyan('AI Model:'), 'Google Gemini 1.5 Flash');
  console.log(chalk.cyan('Features:'), 'Code generation, Chat, File analysis, API rotation');
  console.log(chalk.cyan('Prefix:'), 'el');
  
  console.log(chalk.gray('\n🌟 Capabilities:'));
  console.log(chalk.gray('• Generate code in any programming language'));
  console.log(chalk.gray('• Explain complex programming concepts'));
  console.log(chalk.gray('• Debug and optimize existing code'));
  console.log(chalk.gray('• Provide coding suggestions and best practices'));
  console.log(chalk.gray('• Interactive chat sessions'));
  console.log(chalk.gray('• File analysis and code review'));
  
  
}

async function handlePresets(command, prompt) {
  const preset = presets[command];
  
  if (!preset) {
    console.log(chalk.red(`Unknown preset command: ${command}`));
    console.log(chalk.yellow('Use "el /help" to see available preset commands'));
    return;
  }
  
  if (!prompt && command !== '/help' && command !== '/about') {
    console.log(chalk.yellow(`Please provide a prompt for ${command}`));
    console.log(chalk.gray(`Example: el ${command} your request here`));
    return;
  }
  
  await preset.handler(prompt);
}

module.exports = { handlePresets };
