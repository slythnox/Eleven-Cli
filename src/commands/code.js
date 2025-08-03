const geminiService = require('../services/gemini');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

async function handleCode(prompt, options = {}) {
  try {
    let fullPrompt = '';
    let originalFile = null;
    let originalContent = null;
    
    if (options.file) {
      // Analyze existing code file
      if (!fs.existsSync(options.file)) {
        console.error(chalk.red(`File not found: ${options.file}`));
        return;
      }
      
      originalFile = options.file;
      try {
        originalContent = fs.readFileSync(options.file, 'utf8');
      } catch (error) {
        console.error(chalk.red(`Error reading file: ${error.message}`));
        return;
      }
      
      if (options.fix || options.rewrite || options.modify) {
        // Mode for modifying existing files
        fullPrompt = `Please analyze this code and provide the complete rewritten/fixed version:\n\n\`\`\`${path.extname(options.file).slice(1)}\n${originalContent}\n\`\`\``;
        
        if (prompt) {
          fullPrompt += `\n\nSpecific request: ${prompt}`;
        }
        
        fullPrompt += '\n\nPlease provide ONLY the complete corrected code without explanations. The code should be production-ready.';
      } else {
        // Analysis mode
        fullPrompt = `Please analyze and explain this code file (${options.file}):\n\n\`\`\`${path.extname(options.file).slice(1)}\n${originalContent}\n\`\`\``;
        
        if (prompt) {
          fullPrompt += `\n\nAdditional request: ${prompt}`;
        }
      }
    } else if (prompt) {
      // Generate new code
      fullPrompt = `Please help me with this coding request: ${prompt}`;

      if (options.language) {
        fullPrompt += `\n\nPlease use ${options.language} programming language.`;
      }
      
      if (options.output) {
        fullPrompt += '\n\nPlease provide clean, well-documented code with explanations.';
      } else {
        fullPrompt += '\n\nPlease provide ONLY the code without explanations if this is for file output.';
      }
    } else {
      console.log(chalk.yellow('Please provide either a prompt or a file to analyze.'));
      console.log(chalk.gray('Examples:'));
      console.log(chalk.gray('  el code "create a function to sort an array" -o myfile.js'));
      console.log(chalk.gray('  el code -f myfile.js --fix'));
      console.log(chalk.gray('  el code -f myfile.js --modify "add error handling"'));
      console.log(chalk.gray('  el code -l python "create a web scraper"'));
      return;
    }

    const spinner = ora("Generating code...").start();

    try {
      const response = await geminiService.generateResponse(fullPrompt);
      spinner.stop();
      
      // Extract code blocks from response
      const codeBlocks = extractCodeBlocks(response);
      
      if (options.fix || options.rewrite || options.modify) {
        // Handle file modification
        await handleFileModification(originalFile, originalContent, response, codeBlocks);
      } else if (options.output) {
        // Handle new file creation
        await handleFileCreation(options.output, response, codeBlocks);
      } else {
        // Regular display mode
        console.log(chalk.blue('\n🤖 Eleven Code Assistant:'));
        console.log(response);
        console.log('');
      }
      
    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

function extractCodeBlocks(response) {
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  
  while ((match = codeBlockRegex.exec(response)) !== null) {
    blocks.push(match[1].trim());
  }
  
  return blocks;
}

async function handleFileModification(filePath, originalContent, response, codeBlocks) {
  console.log(chalk.blue('\n🔧 Code Modification Results:'));
  
  if (codeBlocks.length === 0) {
    console.log(chalk.yellow('No code blocks found in response. Showing full response:'));
    console.log(response);
    return;
  }
  
  const newContent = codeBlocks[0]; // Use the first code block
  
  // Show diff preview
  console.log(chalk.gray('\n📝 Changes Preview:'));
  console.log(chalk.red('- Original lines: ') + originalContent.split('\n').length);
  console.log(chalk.green('+ Modified lines: ') + newContent.split('\n').length);
  
  // Ask for confirmation
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow(`Apply changes to ${filePath}?`),
      default: false
    }
  ]);
  
  if (confirm) {
    // Create backup
    try {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.writeFileSync(backupPath, originalContent);
      console.log(chalk.gray(`📋 Backup created: ${backupPath}`));
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Could not create backup: ${error.message}`));
    }
    
    // Write new content
    try {
      fs.writeFileSync(filePath, newContent);
      console.log(chalk.green(`✅ File updated: ${filePath}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error writing file: ${error.message}`));
      return;
    }
    
    // Offer to show the changes
    const { showChanges } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'showChanges',
        message: 'Show the updated code?',
        default: true
      }
    ]);
    
    if (showChanges) {
      console.log(chalk.blue('\n📄 Updated Code:'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(newContent);
      console.log(chalk.gray('─'.repeat(50)));
    }
  } else {
    console.log(chalk.yellow('Changes cancelled. File unchanged.'));
    
    // Still show the proposed changes
    console.log(chalk.blue('\n📄 Proposed Changes:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(newContent);
    console.log(chalk.gray('─'.repeat(50)));
  }
}

async function handleFileCreation(outputPath, response, codeBlocks) {
  console.log(chalk.blue('\n💾 Creating New File:'));
  
  if (codeBlocks.length === 0) {
    console.log(chalk.yellow('No code blocks found. Using full response as content.'));
    const content = response;
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.yellow(`Create file ${outputPath}?`),
        default: true
      }
    ]);
    
    if (confirm) {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, content);
      console.log(chalk.green(`✅ File created: ${outputPath}`));
    }
    return;
  }
  
  const content = codeBlocks[0]; // Use the first code block
  
  // Preview the content
  console.log(chalk.gray('\n📝 File Preview:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(content.substring(0, 500) + (content.length > 500 ? '\n...(truncated)' : ''));
  console.log(chalk.gray('─'.repeat(50)));
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow(`Create file ${outputPath}?`),
      default: true
    }
  ]);
  
  if (confirm) {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, content);
      console.log(chalk.green(`✅ File created: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error creating file: ${error.message}`));
    }
  }
}

module.exports = { handleCode };
