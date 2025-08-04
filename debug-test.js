#!/usr/bin/env node

// Debug script to test Eleven CLI step by step
const chalk = require('chalk');

async function debugTest() {
  console.log(chalk.blue('🔍 Debugging Eleven CLI...\n'));

  try {
    // Test 1: Load settings
    console.log(chalk.cyan('1. Testing settings module:'));
    const settings = require('./src/config/settings');
    const config = settings.getConfig();
    console.log(`   ✅ Settings loaded`);
    console.log(`   API Key configured: ${config.apiKey ? 'Yes' : 'No'}`);
    
    if (!config.apiKey) {
      console.log(chalk.red('   ❌ No API key found!'));
      console.log(chalk.yellow('   💡 Run: el config'));
      return;
    }

    // Test 2: Load Gemini service
    console.log(chalk.cyan('\n2. Testing Gemini service:'));
    const geminiService = require('./src/services/gemini');
    console.log(`   ✅ Gemini service loaded`);

    // Test 3: Initialize Gemini
    console.log(chalk.cyan('\n3. Initializing Gemini API:'));
    try {
      geminiService.initialize();
      console.log(`   ✅ Gemini initialized`);
    } catch (error) {
      console.log(`   ❌ Initialization failed: ${error.message}`);
      return;
    }

    // Test 4: Simple API call
    console.log(chalk.cyan('\n4. Testing simple API call:'));
    try {
      const response = await geminiService.generateResponse('Hello, just say "Hi" back');
      console.log(`   ✅ API call successful`);
      console.log(`   Response: ${response.substring(0, 50)}...`);
    } catch (error) {
      console.log(`   ❌ API call failed: ${error.message}`);
      console.error('   Full error:', error);
      return;
    }

    // Test 5: Test preset command
    console.log(chalk.cyan('\n5. Testing preset command:'));
    try {
      const { handlePresets } = require('./src/commands/presets');
      console.log(`   ✅ Preset command loaded`);
      
      // Don't actually run it, just test loading
      console.log(`   ✅ Ready to handle presets`);
    } catch (error) {
      console.log(`   ❌ Preset command failed: ${error.message}`);
      return;
    }

    console.log(chalk.green('\n🎉 All tests passed! CLI should work now.'));
    console.log(chalk.gray('Try: el /write a simple hello world program'));

  } catch (error) {
    console.error(chalk.red(`❌ Debug test failed: ${error.message}`));
    console.error('Full error:', error);
  }
}

if (require.main === module) {
  debugTest();
}

module.exports = { debugTest };