const settings = require("../config/settings");
const chalk = require("chalk");
const inquirer = require("inquirer");

async function handleConfig(options = {}) {
  try {
    if (options.show) {
      const config = settings.getConfig();
      console.log(chalk.green("\n📋 Current Configuration:"));
      console.log(chalk.gray("────────────────────────"));
      console.log(
        `${chalk.cyan("API Key:")} ${config.apiKey ? "✅ Set" : "❌ Not set"}`
      );
      console.log(
        `${chalk.cyan("Additional Keys:")} ${
          config.apiKeys ? config.apiKeys.length : 0
        }`
      );
      console.log(
        `${chalk.cyan("API Rotation:")} ${
          config.useRotation ? "✅ Enabled" : "❌ Disabled"
        }`
      );
      if (config.useRotation && config.apiKeys) {
        console.log(
          `${chalk.cyan("Current Key Index:")} ${config.currentKeyIndex + 1}/${
            config.apiKeys.length
          }`
        );
      }
      console.log(`${chalk.cyan("Model:")} ${config.model}`);
      console.log(`${chalk.cyan("Max Tokens:")} ${config.maxTokens}`);
      console.log(`${chalk.cyan("Temperature:")} ${config.temperature}`);
      console.log("");
      return;
    }

    if (options.key) {
      settings.setApiKey(options.key);
      console.log(chalk.green("✅ API key saved successfully!"));
      return;
    }

    if (options.addKey) {
      settings.addApiKey(options.addKey);
      console.log(chalk.green("✅ Additional API key added for rotation!"));
      console.log(chalk.yellow("💡 Enable rotation with: el config -r"));
      return;
    }

    if (options.rotation) {
      const config = settings.toggleRotation();
      console.log(
        chalk.green(
          `✅ API rotation ${config.useRotation ? "enabled" : "disabled"}!`
        )
      );
      if (
        config.useRotation &&
        (!config.apiKeys || config.apiKeys.length < 2)
      ) {
        console.log(
          chalk.yellow(
            "⚠️  Add more API keys for effective rotation: el config -a YOUR_SECOND_KEY"
          )
        );
      }
      return;
    }

    // Interactive configuration
    console.log(chalk.green("🔧 Eleven CLI Configuration"));
    console.log(chalk.gray("Let's set up your Gemini API key for Eleven.\n"));

    console.log(chalk.yellow("To get your free Gemini API key for Eleven:"));
    console.log(
      chalk.gray(
        "1. Visit: https://makersuite.google.com/app/apikey\n" +
          '2. Click "Create API key"\n' +
          "3. Copy the generated key\n" +
          "4. Paste the key below and press enter"
      )
    );

    const { apiKey } = await inquirer.prompt([
      {
        type: "password",
        name: "apiKey",
        message: "Enter your Gemini API key:",
        mask: "*",
        validate: (input) => input.trim() !== "" || "API key cannot be empty",
      },
    ]);

    settings.setApiKey(apiKey.trim());
    console.log(chalk.green("\n✅ Configuration saved successfully!"));
    console.log(
      chalk.gray('You can now use Eleven. Try: el ask "Hello, how are you?"')
    );
    console.log(
      chalk.yellow(
        "\n💡 Pro tip: Add more API keys for rotation to avoid rate limits:"
      )
    );
    console.log(chalk.gray("el config -a YOUR_SECOND_KEY"));
    console.log(chalk.gray("el config -r  # Enable rotation"));
  } catch (error) {
    console.error(chalk.red(`Configuration error: ${error}`));
    process.exit(1);
  }
}

module.exports = { handleConfig };
