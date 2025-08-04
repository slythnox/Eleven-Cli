#!/usr/bin/env node

// Quick test script to verify Eleven CLI setup
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

console.log(chalk.blue('🔍 Testing Eleven CLI Setup...\n'));

// Test 1: Check if main files exist
const requiredFiles = [
  'bin/eleven.js',
  'src/commands/chat.js',
  'src/commands/config.js',
  'src/commands/code.js',
  'src/services/gemini.js',
  'src/config/settings.js'
];

console.log(chalk.cyan('📁 Checking required files:'));
let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log(chalk.red('\n❌ Some required files are missing!'));
  process.exit(1);
}

// Test 2: Check dependencies
console.log(chalk.cyan('\n📦 Checking dependencies:'));
const requiredDeps = ['@google/generative-ai', 'chalk', 'commander', 'inquirer', 'ora'];
let allDepsAvailable = true;

requiredDeps.forEach(dep => {
  try {
    require(dep);
    console.log(`   ✅ ${dep}`);
  } catch (error) {
    console.log(`   ❌ ${dep} - ${error.message}`);
    allDepsAvailable = false;
  }
});

if (!allDepsAvailable) {
  console.log(chalk.red('\n❌ Some dependencies are missing!'));
  console.log(chalk.yellow('💡 Run: npm install'));
  process.exit(1);
}

// Test 3: Try to load main modules
console.log(chalk.cyan('\n🔧 Testing module loading:'));
try {
  const settings = require('./src/config/settings');
  console.log('   ✅ Settings module');
  
  const gemini = require('./src/services/gemini');
  console.log('   ✅ Gemini service');
  
  const { handleConfig } = require('./src/commands/config');
  console.log('   ✅ Config command');
  
  const { handleChat } = require('./src/commands/chat');
  console.log('   ✅ Chat command');
  
} catch (error) {
  console.log(`   ❌ Module loading failed: ${error.message}`);
  process.exit(1);
}

// Test 4: Check binary permissions
console.log(chalk.cyan('\n🔐 Checking binary permissions:'));
const binPath = path.join(__dirname, 'bin', 'eleven.js');
try {
  const stats = fs.statSync(binPath);
  const isExecutable = !!(stats.mode & parseInt('111', 8));
  console.log(`   ${isExecutable ? '✅' : '❌'} Binary is executable`);
  
  if (!isExecutable) {
    console.log(chalk.yellow('💡 Run: chmod +x bin/eleven.js'));
  }
} catch (error) {
  console.log(`   ❌ Cannot check binary permissions: ${error.message}`);
}

console.log(chalk.green('\n🎉 Setup test completed!'));
console.log(chalk.gray('Next steps:'));
console.log(chalk.gray('1. Run: npm link (to make "el" command available globally)'));
console.log(chalk.gray('2. Run: el config (to setup your API key)'));
console.log(chalk.gray('3. Test: el ask "Hello!"'));