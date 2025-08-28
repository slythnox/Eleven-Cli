const vscodeIntegration = require('../utils/vscode-integration');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

async function handleVSCode(options = {}) {
  try {
    console.log(chalk.green('🔧 VS Code Integration Setup'));
    console.log(chalk.gray('─'.repeat(40)));

    if (options.setup) {
      const workspacePath = options.path || process.cwd();
      await vscodeIntegration.setupWorkspace(workspacePath);
      
      // Offer to setup keybindings
      const { setupKeybindings } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'setupKeybindings',
          message: 'Setup keyboard shortcuts for Eleven commands?',
          default: true
        }
      ]);

      if (setupKeybindings) {
        const keybindings = vscodeIntegration.generateKeyBindings();
        console.log(chalk.blue('\n⌨️  Recommended Keybindings:'));
        console.log(chalk.gray('Add these to your VS Code keybindings.json:'));
        console.log(chalk.yellow(JSON.stringify(keybindings, null, 2)));
        
        console.log(chalk.gray('\nTo add them:'));
        console.log(chalk.gray('1. Press Ctrl+Shift+P'));
        console.log(chalk.gray('2. Type "Preferences: Open Keyboard Shortcuts (JSON)"'));
        console.log(chalk.gray('3. Add the above keybindings to the array'));
      }

      console.log(chalk.green('\n✨ VS Code integration setup complete!'));
      console.log(chalk.gray('\nYou can now:'));
      console.log(chalk.gray('• Use Ctrl+Shift+P → "Tasks: Run Task" to run Eleven commands'));
      console.log(chalk.gray('• Right-click files and use Eleven through tasks'));
      console.log(chalk.gray('• Use keyboard shortcuts (if configured)'));
      
      return;
    }

    if (options.check) {
      const hasVSCode = await vscodeIntegration.checkVSCode();
      console.log(chalk.cyan('VS Code Status:'), hasVSCode ? chalk.green('✅ Available') : chalk.red('❌ Not found'));
      
      if (hasVSCode) {
        console.log(chalk.gray('VS Code CLI is available. You can use file operations.'));
      } else {
        console.log(chalk.yellow('Install VS Code CLI to enable advanced features.'));
      }
      return;
    }

    if (options.diff && options.file) {
      // Show diff for a file (useful for previewing changes)
      if (!fs.existsSync(options.file)) {
        console.error(chalk.red(`File not found: ${options.file}`));
        return;
      }

      console.log(chalk.blue('📄 Creating diff view...'));
      // This would typically be called after generating modified content
      console.log(chalk.yellow('This feature requires modified content to compare against.'));
      console.log(chalk.gray('Use: el code -f yourfile.js --fix --preview'));
      return;
    }

    // Interactive setup
    console.log(chalk.blue('🚀 Interactive VS Code Setup'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Setup VS Code integration for current workspace', value: 'setup' },
          { name: 'Check VS Code availability', value: 'check' },
          { name: 'Show integration guide', value: 'guide' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }
    ]);

    switch (action) {
      case 'setup':
        await vscodeIntegration.setupWorkspace(process.cwd());
        break;
      case 'check':
        await handleVSCode({ check: true });
        break;
      case 'guide':
        showIntegrationGuide();
        break;
      default:
        console.log(chalk.gray('Setup cancelled.'));
    }

  } catch (error) {
    console.error(chalk.red(`VS Code integration error: ${error.message}`));
  }
}

function showIntegrationGuide() {
  console.log(chalk.green('\n📚 Eleven VS Code Integration Guide'));
  console.log(chalk.gray('═'.repeat(50)));
  
  console.log(chalk.cyan('\n1. Basic Setup:'));
  console.log(chalk.gray('   el vscode --setup'));
  
  console.log(chalk.cyan('\n2. Fix Files:'));
  console.log(chalk.gray('   el fix myfile.js'));
  console.log(chalk.gray('   el code -f myfile.js --fix'));
  
  console.log(chalk.cyan('\n3. Rewrite Files:'));
  console.log(chalk.gray('   el rewrite myfile.js "make it more efficient"'));
  console.log(chalk.gray('   el code -f myfile.js --rewrite'));
  
  console.log(chalk.cyan('\n4. Generate New Files:'));
  console.log(chalk.gray('   el code -o newfile.js "create a REST API handler"'));
  
  console.log(chalk.cyan('\n5. VS Code Tasks:'));
  console.log(chalk.gray('   • Ctrl+Shift+P → "Tasks: Run Task"'));
  console.log(chalk.gray('   • Select "Eleven: Fix Current File"'));
  console.log(chalk.gray('   • Or use custom keybindings'));
  
  console.log(chalk.cyan('\n6. Workflow Examples:'));
  console.log(chalk.gray('   • Open file in VS Code'));
  console.log(chalk.gray('   • Run: el fix filename.js'));
  console.log(chalk.gray('   • Review changes and accept/reject'));
  console.log(chalk.gray('   • File is automatically updated'));
  
  console.log(chalk.yellow('\n💡 Pro Tips:'));
  console.log(chalk.gray('   • Always backup files (automatic by default)'));
  console.log(chalk.gray('   • Use --preview to see changes before applying'));
  console.log(chalk.gray('   • Set up multiple API keys for better rate limits'));
}

module.exports = { handleVSCode };
