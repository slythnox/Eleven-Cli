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

// scripts/post-install.js
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

function postInstall() {
  try {
    console.log(chalk.cyan('\n🎉 Eleven CLI installed successfully!'));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Check if this is a global install
    const isGlobal = __dirname.includes('lib/node_modules') || __dirname.includes('global');
    
    if (isGlobal) {
      console.log(chalk.green('✅ Globally installed - ready to use!'));
      console.log(chalk.yellow('\n🚀 Quick start:'));
      console.log(chalk.gray('   1. Configure: el config'));
      console.log(chalk.gray('   2. Test: el ask "Hello!"'));
      console.log(chalk.gray('   3. Help: el --help'));
    } else {
      console.log(chalk.yellow('📦 Locally installed'));
      console.log(chalk.gray('For global access, run: npm link'));
    }
    
    console.log(chalk.blue('\n📚 Documentation:'));
    console.log(chalk.gray('   GitHub: https://github.com/slythnox/eleven-cli'));
    console.log(chalk.gray('   Issues: https://github.com/slythnox/eleven-cli/issues'));
    
    // Create .eleven-cli directory if it doesn't exist
    const configDir = path.join(require('os').homedir(), '.eleven-cli');
    if (!fs.existsSync(configDir)) {
      try {
        fs.mkdirSync(configDir, { recursive: true });
        console.log(chalk.green('✅ Created config directory'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not create config directory'));
      }
    }
    
    console.log(chalk.gray('\n' + '─'.repeat(50)));
    console.log(chalk.bold.green('Welcome to Eleven CLI! 🤖'));
    console.log(chalk.gray('Made with ❤️  by Slythnox'));
    
  } catch (error) {
    console.error(chalk.red(`Post-install script error: ${error.message}`));
  }
}

if (require.main === module) {
  postInstall();
}

module.exports = { postInstall };
