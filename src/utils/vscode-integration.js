const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chalk = require('chalk');

class VSCodeIntegration {
  constructor() {
    this.tempDir = path.join(require('os').tmpdir(), 'eleven-vscode');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // Create a file that VS Code can watch for changes
  async createCommandFile(command, filePath = null) {
    const commandFile = path.join(this.tempDir, 'command.json');
    const commandData = {
      command,
      filePath,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    try {
      fs.writeFileSync(commandFile, JSON.stringify(commandData, null, 2));
      return commandFile;
    } catch (error) {
      throw new Error(`Failed to create command file: ${error.message}`);
    }
  }

  // Update command status
  updateCommandStatus(status, result = null) {
    const commandFile = path.join(this.tempDir, 'command.json');
    try {
      if (fs.existsSync(commandFile)) {
        const commandData = JSON.parse(fs.readFileSync(commandFile, 'utf8'));
        commandData.status = status;
        commandData.result = result;
        commandData.completedAt = Date.now();
        fs.writeFileSync(commandFile, JSON.stringify(commandData, null, 2));
      }
    } catch (error) {
      console.error(`Error updating command status: ${error.message}`);
    }
  }

  // Check if VS Code is available
  async checkVSCode() {
    return new Promise((resolve) => {
      exec('code --version', (error) => {
        resolve(!error);
      });
    });
  }

  // Open file in VS Code
  async openInVSCode(filePath) {
    const hasVSCode = await this.checkVSCode();
    if (hasVSCode) {
      return new Promise((resolve, reject) => {
        exec(`code "${filePath}"`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
    throw new Error('VS Code not found in PATH');
  }

  // Create a diff view in VS Code
  async showDiff(originalFile, modifiedContent) {
    const hasVSCode = await this.checkVSCode();
    if (!hasVSCode) {
      throw new Error('VS Code not found in PATH');
    }

    try {
      const tempFile = path.join(this.tempDir, `modified_${path.basename(originalFile)}`);
      fs.writeFileSync(tempFile, modifiedContent);

      return new Promise((resolve, reject) => {
        exec(`code --diff "${originalFile}" "${tempFile}"`, (error) => {
          if (error) reject(error);
          else resolve(tempFile);
        });
      });
    } catch (error) {
      throw new Error(`Failed to create diff view: ${error.message}`);
    }
  }

  // Generate VS Code settings for Eleven integration
  generateVSCodeSettings() {
    const settings = {
      "eleven.autoFixOnSave": false,
      "eleven.showDiffBeforeApply": true,
      "eleven.createBackups": true,
      "eleven.cliPath": "el",
      "files.watcherExclude": {
        "**/node_modules/**": true,
        "**/.git/objects/**": true,
        "**/.eleven-cli/**": true
      }
    };

    const tasks = {
      "version": "2.0.0",
      "tasks": [
        {
          "label": "Eleven: Fix Current File",
          "type": "shell",
          "command": "el",
          "args": ["fix", "${file}"],
          "group": "build",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared"
          }
        },
        {
          "label": "Eleven: Rewrite Current File",
          "type": "shell",
          "command": "el",
          "args": ["rewrite", "${file}"],
          "group": "build",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared"
          }
        },
        {
          "label": "Eleven: Analyze Current File",
          "type": "shell",
          "command": "el",
          "args": ["code", "-f", "${file}"],
          "group": "build",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared"
          }
        }
      ]
    };

    return { settings, tasks };
  }

  // Setup VS Code workspace for Eleven
  async setupWorkspace(workspacePath) {
    try {
      const vscodeDir = path.join(workspacePath, '.vscode');
      
      if (!fs.existsSync(vscodeDir)) {
        fs.mkdirSync(vscodeDir, { recursive: true });
      }

      const { settings, tasks } = this.generateVSCodeSettings();

      // Write settings
      const settingsPath = path.join(vscodeDir, 'settings.json');
      if (fs.existsSync(settingsPath)) {
        const existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        Object.assign(existingSettings, settings);
        fs.writeFileSync(settingsPath, JSON.stringify(existingSettings, null, 2));
      } else {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      }

      // Write tasks
      const tasksPath = path.join(vscodeDir, 'tasks.json');
      fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));

      console.log(chalk.green('✅ VS Code workspace configured for Eleven!'));
      console.log(chalk.gray('Available tasks:'));
      console.log(chalk.gray('  • Ctrl+Shift+P → "Tasks: Run Task" → "Eleven: Fix Current File"'));
      console.log(chalk.gray('  • Ctrl+Shift+P → "Tasks: Run Task" → "Eleven: Rewrite Current File"'));
      console.log(chalk.gray('  • Ctrl+Shift+P → "Tasks: Run Task" → "Eleven: Analyze Current File"'));
    } catch (error) {
      throw new Error(`Failed to setup VS Code workspace: ${error.message}`);
    }
  }

  // Generate keybindings for VS Code
  generateKeyBindings() {
    return [
      {
        "key": "ctrl+alt+f",
        "command": "workbench.action.tasks.runTask",
        "args": "Eleven: Fix Current File",
        "when": "editorTextFocus"
      },
      {
        "key": "ctrl+alt+r",
        "command": "workbench.action.tasks.runTask", 
        "args": "Eleven: Rewrite Current File",
        "when": "editorTextFocus"
      },
      {
        "key": "ctrl+alt+a",
        "command": "workbench.action.tasks.runTask",
        "args": "Eleven: Analyze Current File", 
        "when": "editorTextFocus"
      }
    ];
  }
}

module.exports = new VSCodeIntegration();
