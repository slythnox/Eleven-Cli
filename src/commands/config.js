// src/commands/config.js
const path = require("path");
const chalk = require("chalk");
const inquirer = require("inquirer");

// Load settings with proper error handling
let settings;
try {
  settings = require("../config/settings");
} catch (error) {
  console.error(chalk.red('❌ Failed to load settings module:'), error.message);
  process.exit(1);
}

async function handleConfig(options = {}) {
  try {
    if (options.show) {
      await showCurrentConfig();
      return;
    }

    if (options.key) {
      try {
        settings.setApiKey(options.key);
        console.log(chalk.green("✅ API key saved successfully!"));
        console.log(chalk.gray(`📁 Stored in: ${settings.getConfigPath()}`));
      } catch (error) {
        console.error(chalk.red(`❌ Error saving API key: ${error.message}`));
        return;
      }
      return;
    }

    if (options.addKey) {
      try {
        settings.addApiKey(options.addKey);
        console.log(chalk.green("✅ Additional API key added for rotation!"));
        console.log(chalk.yellow("💡 Enable rotation with: el config -r"));
      } catch (error) {
        console.error(chalk.red(`❌ Error adding API key: ${error.message}`));
        return;
      }
      return;
    }

    if (options.rotation) {
      try {
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
      } catch (error) {
        console.error(chalk.red(`❌ Error toggling rotation: ${error.message}`));
        return;
      }
      return;
    }

    // Interactive configuration
    await interactiveConfig();

  } catch (error) {
    console.error(chalk.red(`Configuration error: ${error.message}`));
    console.log(chalk.yellow('\n🔧 Troubleshooting:'));
    console.log(chalk.gray('• Check write permissions to home directory'));
    console.log(chalk.gray('• Verify API key format (should start with "AI")'));
    console.log(chalk.gray('• Try running with administrator privileges'));
    process.exit(1);
  }
}

async function showCurrentConfig() {
  try {
    const config = settings.getConfig();
    console.log(chalk.green("\n📋 Current Configuration"));
    console.log(chalk.gray("═".repeat(40)));
    console.log(
      `${chalk.cyan("📁 Config Location:")} ${chalk.gray(settings.getConfigPath())}`
    );
    console.log(
      `${chalk.cyan("🔑 Primary API Key:")} ${config.apiKey ? "✅ Set" : "❌ Not set"}`
    );
    console.log(
      `${chalk.cyan("🔄 Additional Keys:")} ${
        config.apiKeys ? config.apiKeys.length : 0
      }`
    );
    console.log(
      `${chalk.cyan("🔀 API Rotation:")} ${
        config.useRotation ? "✅ Enabled" : "❌ Disabled"
      }`
    );
    if (config.useRotation && config.apiKeys) {
      console.log(
        `${chalk.cyan("📍 Current Key Index:")} ${config.currentKeyIndex + 1}/${
          config.apiKeys.length
        }`
      );
    }
    console.log(`${chalk.cyan("🤖 Model:")} ${config.model}`);
    console.log(`${chalk.cyan("📊 Max Tokens:")} ${config.maxTokens}`);
    console.log(`${chalk.cyan("🌡️  Temperature:")} ${config.temperature}`);
    
    // Health check
    console.log(chalk.gray("\n⚡ Connection Status:"));
    try {
      const geminiService = require("../services/gemini");
      const isHealthy = await geminiService.healthCheck();
      console.log(`${chalk.cyan("🔗 Gemini API:")} ${isHealthy ? "✅ Connected" : "❌ Connection Failed"}`);
    } catch (error) {
      console.log(`${chalk.cyan("🔗 Gemini API:")} ${chalk.red("❌ Error: " + error.message)}`);
    }
    
    console.log("");
  } catch (error) {
    console.error(chalk.red(`❌ Error reading configuration: ${error.message}`));
  }
}

async function interactiveConfig() {
  console.log(chalk.green("🔧 Eleven CLI Configuration"));
  console.log(chalk.gray("Let's set up your Gemini API key for Eleven.\n"));

  console.log(chalk.yellow("📝 To get your free Gemini API key:"));
  console.log(
    chalk.gray(
      "1. Visit: https://makersuite.google.com/app/apikey\n" +
        '2. Click "Create API key"\n' +
        "3. Copy the generated key\n" +
        "4. Paste the key below and press enter"
    )
  );

  try {
    const { apiKey } = await inquirer.prompt([
      {
        type: "password",
        name: "apiKey",
        message: "Enter your Gemini API key:",
        mask: "*",
        validate: (input) => {
          if (!input || input.trim() === "") {
            return "API key cannot be empty";
          }
          if (!input.trim().startsWith("AI")) {
            return "Invalid API key format. Gemini API keys should start with 'AI'";
          }
          if (input.trim().length < 30) {
            return "API key seems too short. Please check your key.";
          }
          return true;
        },
      },
    ]);

    settings.setApiKey(apiKey.trim());
    console.log(chalk.green("\n✅ Configuration saved successfully!"));
    console.log(chalk.gray(`📁 Saved to: ${settings.getConfigPath()}`));
    console.log(
      chalk.gray('🚀 You can now use Eleven. Try: el ask "Hello, how are you?"')
    );
    console.log(
      chalk.yellow(
        "\n💡 Pro tip: Add more API keys for rotation to avoid rate limits:"
      )
    );
    console.log(chalk.gray("   el config -a YOUR_SECOND_KEY"));
    console.log(chalk.gray("   el config -r  # Enable rotation"));

    // Test the connection
    console.log(chalk.blue("\n🔍 Testing connection..."));
    try {
      const geminiService = require("../services/gemini");
      const isHealthy = await geminiService.healthCheck();
      if (isHealthy) {
        console.log(chalk.green("✅ Connection successful! Eleven is ready to use."));
      } else {
        console.log(chalk.yellow("⚠️  Connection test failed. Please verify your API key."));
      }
    } catch (error) {
      console.log(chalk.red(`❌ Connection test failed: ${error.message}`));
    }

  } catch (error) {
    if (error.isTtyError) {
      console.log(chalk.red("❌ Interactive prompts are not supported in this environment"));
      console.log(chalk.yellow("💡 Use: el config -k YOUR_API_KEY"));
    } else {
      throw error;
    }
  }
}

module.exports = { handleConfig };
