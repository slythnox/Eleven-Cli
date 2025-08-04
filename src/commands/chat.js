const geminiService = require("../services/gemini");
const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");
const fs = require("fs");
const path = require("path");

async function handleChat(options = {}) {
  try {
    // Handle single message mode
    if (options.message) {
      const spinner = ora("Thinking...").start();

      try {
        let prompt = options.message;

        // Include file content if specified
        if (options.file) {
          const filePath = path.resolve(options.file);
          if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, "utf8");
            prompt += `\n\nFile content (${options.file}):\n\`\`\`\n${fileContent}\n\`\`\``;
          } else {
            spinner.fail(`File not found: ${options.file}`);
            return;
          }
        }

        const response = await geminiService.generateResponse(prompt);
        spinner.stop();

        console.log(chalk.blue("\nEleven:"));
        console.log(response);
        console.log("");
      } catch (error) {
        spinner.fail(chalk.red(`Error: ${error.message}`));
        if (
          error.message.includes("rate limit") ||
          error.message.includes("quota")
        ) {
          console.log(
            chalk.yellow("\n💡 Tip: Add more API keys to avoid rate limits:")
          );
          console.log(
            chalk.gray(`
el config -a YOUR_ADDITIONAL_KEY
el config -r  # Enable rotation
`)
          );
        }
      }
      return;
    }

    // Interactive chat mode
    console.log(chalk.green("Starting chat session with Eleven..."));
    console.log(
      chalk.gray(
        'Type "exit", "quit", or press Ctrl+C to end the conversation.\n'
      )
    );

    while (true) {
      const { message } = await inquirer.prompt([
        {
          type: "input",
          name: "message",
          message: chalk.cyan("You:"),
          validate: (input) => input.trim() !== "" || "Please enter a message",
        },
      ]);

      if (["exit", "quit", "bye"].includes(message.toLowerCase())) {
        console.log(chalk.green("👋 See you later, Slythnox!"));
        break;
      }

      console.log(chalk.blue("\nEleven:"));

      try {
        // Stream the response for better UX
        await geminiService.generateStreamResponse(message, (chunk) => {
          process.stdout.write(chunk);
        });
        console.log("\n");
      } catch (error) {
        console.log(chalk.red(`\nError: ${error.message}\n`));
        if (
          error.message.includes("rate limit") ||
          error.message.includes("quota")
        ) {
          console.log(
            chalk.yellow("💡 Tip: Add more API keys to avoid rate limits:")
          );
          console.log(chalk.gray(`
el config -a YOUR_ADDITIONAL_KEY
el config -r  # Enable rotation
`));
        }
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = { handleChat };
