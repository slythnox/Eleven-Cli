#!/usr/bin/env node

const { program } = require('commander');
const { showWelcome } = require('./utils/welcome');

// Main entry point for the CLI
function main() {
  try {
    showWelcome();
    
    // Import and run the main CLI program
    require('../bin/eleven.js');
  } catch (error) {
    console.error('Error starting Eleven CLI:', error.message);
    process.exit(1);
  }
}

// Export for potential programmatic use
module.exports = {
  program,
  main
};

// Run if called directly
if (require.main === module) {
  main();
}