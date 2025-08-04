// scripts/setup.js
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

function setup() {
  console.log(chalk.cyan('🚀 Setting up Eleven CLI...'));
  
  try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      console.error(chalk.red('❌ Node.js 16+ is required'));
      console.log(chalk.yellow('Please upgrade Node.js: https://nodejs.org'));
      process.exit(1);
    }
    
    console.log(chalk.green(`✅ Node.js ${nodeVersion} detected`));
    
    // Install dependencies
    console.log(chalk.blue('📦 Installing dependencies...'));
    execSync('npm install', { stdio: 'inherit' });
    
    // Make binary executable
    const binPath = path.join(__dirname, '..', 'bin', 'eleven.js');
    if (fs.existsSync(binPath)) {
      try {
        fs.chmodSync(binPath, '755');
        console.log(chalk.green('✅ Made binary executable'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not make binary executable'));
      }
    }
    
    // Create global link
    console.log(chalk.blue('🔗 Creating global link...'));
    try {
      execSync('npm link', { stdio: 'inherit' });
      console.log(chalk.green('✅ Global link created'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not create global link. Try: sudo npm link'));
    }
    
    console.log(chalk.green('\n🎉 Setup complete!'));
    console.log(chalk.gray('Try: el --help'));
    
  } catch (error) {
    console.error(chalk.red(`❌ Setup failed: ${error.message}`));
    process.exit(1);
  }
}

if (require.main === module) {
  setup();
}

module.exports = { setup };


