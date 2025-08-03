const geminiService = require("../services/gemini");
const chalk = require("chalk");
const ora = require("ora");
const fs = require("fs");

async function handleCode(prompt, options = {}) {
  try {
    let fullPrompt = "";

    if (options.file) {
      // Analyze existing code file
      if (!fs.existsSync(options.file)) {
        console.error(chalk.red(`File not found: ${options.file}`));
        return;
      }

      const fileContent = fs.readFileSync(options.file, "utf8");
      fullPrompt = `Please analyze and explain this code file (${options.file}):\n\n\`\`\`\n${fileContent}\n\`\`\``;

      if (prompt) {
        fullPrompt += `\n\nAdditional request: ${prompt}`;
      }
    } else if (prompt) {
      // Generate new code
      fullPrompt = `Please help me with this coding request: ${prompt}`;

      if (options.language) {
        fullPrompt += `\n\nPlease use ${options.language} programming language.`;
      }

      fullPrompt +=
        "\n\nPlease provide clean, well-documented code with explanations.";
    } else {
      console.log(
        chalk.yellow("Please provide either a prompt or a file to analyze.")
      );
      console.log(
        chalk.gray(`
Examples:
  eleven code "create a function to sort an array"
  eleven code -f myfile.js
  eleven code -l python "create a web scraper"
`)
      );

      return;
    }

    const spinner = ora("Generating code...").start();

    try {
      const response = await geminiService.generateResponse(fullPrompt);
      spinner.stop();

      console.log(chalk.blue("\n🤖 Eleven Code Assistant:"));
      console.log(response);
      console.log("");
    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = { handleCode };
