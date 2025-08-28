const chalk = require('chalk');

let welcomeShown = false;

function showWelcome() {
  // Only show welcome once per session, but allow reset
  if (welcomeShown && !process.env.ELEVEN_FORCE_WELCOME) return;
  welcomeShown = true;

  const asciiArt = `
${chalk.cyan('███████╗██╗     ███████╗██╗   ██╗███████╗███╗   ██╗')}
${chalk.cyan('██╔════╝██║     ██╔════╝██║   ██║██╔════╝████╗  ██║')}
${chalk.cyan('█████╗  ██║     █████╗  ██║   ██║█████╗  ██╔██╗ ██║')}
${chalk.cyan('██╔══╝  ██║     ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║')}
${chalk.cyan('███████╗███████╗███████╗ ╚████╔╝ ███████╗██║ ╚████║')}
${chalk.cyan('╚══════╝╚══════╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝')}
`;

  const welcomeText = chalk.bold.green('Welcome back, Slythnox! 🚀');
  const subtitle = chalk.gray('Eleven - Made by Slythnox | Your Personal CLI AI | Prefix: el');
  const divider = chalk.gray('─'.repeat(60));

  console.log(asciiArt);
  console.log(`${' '.repeat(15)}${welcomeText}`);
  console.log(`${' '.repeat(10)}${subtitle}`);
  console.log(`${' '.repeat(10)}${divider}\n`);
}

// Reset welcome flag for new sessions
function resetWelcome() {
  welcomeShown = false;
}

module.exports = { showWelcome, resetWelcome };