# 🔥 Genesis Eleven CLI - AI-Powered Command-Line Assistant

**Eleven** is a revolutionary command-line assistant that brings the power of AI directly to your terminal. Built with Node.js and powered by Google Gemini AI, Forge understands natural language requests and converts them into safe, structured execution plans.

## ✨ Features

- 🧠 **Natural Language Processing** - Describe what you want in plain English
- 🛡️ **Security-First Design** - Built-in validation and sandboxing for safe execution
- 📋 **Smart Planning** - Converts requests into structured, reviewable execution plans
- ⚡ **Multi-Step Execution** - Handles complex workflows with multiple commands
- 🔄 **API Key Rotation** - Multiple Gemini API keys with automatic rotation
- 📊 **Comprehensive Logging** - Full audit trail of all operations
- 🎯 **Risk Assessment** - Intelligent risk analysis for every command
- 🔧 **Configurable Sandbox** - Secure execution environment with customizable limits

## 🚀 Quick Start

### Installation

```bash
# 1. Clone and install
git clone <repository-url>
cd forge-cli
npm install

# 2. Make it globally available
npm link

# 3. Configure your API key
forge config

# 4. Test it works
forge "list files in current directory"
```

### Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API key"
3. Copy the generated key
4. Run `forge config` and paste your key

## 📖 Usage Guide

### Basic Commands

```bash
# Execute natural language commands
forge "move all png files to Pictures folder"
forge "find large files over 100MB"
forge "create a backup of my project"

# Plan without executing
forge plan "delete logs older than 30 days"

# Validate a specific command
forge validate "rm -rf temp/"

# Check system status
forge status --test-api
```

### Advanced Usage

```bash
# Auto-approve all steps (use with caution)
forge -y "install dependencies and start server"

# Verbose output with detailed logging
forge -v "optimize images in current folder"

# Plan-only mode for review
forge -p "clean up docker containers and images"

# Custom configuration
forge -c custom-config.json "deploy to staging"
```

## 🏗️ Architecture

### Core Components

```
src/
├── cli/                 # Command-line interface
├── core/               # Core business logic
│   ├── Planner.js      # Natural language → execution plans
│   ├── SandboxExecutor.js # Safe command execution
│   └── Validator.js    # Security validation
├── api/                # Gemini API integration
│   ├── GeminiClient.js # API client
│   └── ApiManager.js   # Key rotation & retry logic
├── models/             # Data models
│   ├── Plan.js         # Execution plan structure
│   ├── ExecutionResult.js # Command results
│   └── ValidationResult.js # Security validation
├── utils/              # Utilities
│   ├── ConfigManager.js # Configuration management
│   └── LoggingUtil.js  # Structured logging
└── exceptions/         # Custom exceptions
```

### Execution Flow

1. **Natural Language Input** → User describes what they want
2. **AI Planning** → Gemini converts request to structured plan
3. **Security Validation** → Check against denylist and risk assessment
4. **User Approval** → Review and approve high-risk operations
5. **Sandboxed Execution** → Run commands in controlled environment
6. **Results & Logging** → Display results and log everything

## 🛡️ Security Features

### Multi-Layer Protection

- **Denylist Filtering** - Blocks dangerous commands and patterns
- **Risk Assessment** - Categorizes operations by risk level
- **User Confirmation** - Requires approval for high-risk operations
- **Sandboxed Execution** - Isolated execution environment
- **Audit Logging** - Complete trail of all operations

### Risk Levels

- **None** - Safe read-only operations (`ls`, `cat`, `echo`)
- **Low** - File operations in user directories
- **Medium** - System configuration, package installations
- **High** - Destructive operations, system-wide changes

### Configuration

```yaml
# denylist.yaml
commands:
  - "rm -rf /"
  - "sudo rm"
  - "chmod 777"
  - "curl | bash"

patterns:
  - "rm\\s+-rf\\s+/"
  - "\\|\\s*bash"

highRisk:
  - "git reset --hard"
  - "docker system prune"
```

## ⚙️ Configuration

### Basic Setup

```bash
# Interactive configuration
forge config

# Set API key directly
forge config --set gemini.apiKeys "YOUR_API_KEY"

# Add additional keys for rotation
forge config --set gemini.apiKeys "KEY1,KEY2,KEY3"

# Configure sandbox
forge config --set sandbox.workdir "/tmp/forge-work"
forge config --set sandbox.timeout 60000
```

### Configuration File

Located at `~/.forge-cli/config.json`:

```json
{
  "gemini": {
    "model": "gemini-1.5-flash",
    "apiKeys": "your-api-keys-here",
    "timeout": 30000,
    "maxRetries": 3
  },
  "sandbox": {
    "mode": "subprocess",
    "workdir": "/tmp/forge-work",
    "timeout": 30000,
    "maxMemoryMB": 512
  },
  "security": {
    "denylistFile": "src/config/denylist.yaml",
    "requireConfirmation": true,
    "allowHighRisk": false
  }
}
```

## 📊 Logging & Monitoring

### Execution Logs

Every operation is logged with complete details:

```json
{
  "taskId": "task-1703123456789-abc123",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "userQuery": "move png files to Pictures",
  "plan": { /* execution plan */ },
  "validationResult": { /* security validation */ },
  "executionResults": [ /* step results */ ],
  "status": "success"
}
```

### Monitoring Commands

```bash
# System status
forge status

# Recent executions
forge logs --recent 10

# Execution statistics
forge stats

# Clean old logs
forge logs --clean 30
```

## 🔧 Development

### Project Structure

```
forge-cli/
├── bin/forge.js         # CLI entry point
├── src/                 # Source code
├── logs/               # Execution logs
├── package.json        # Dependencies
└── README.md          # This file
```

### Running Tests

```bash
# Install test dependencies
npm install --dev

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 🎯 Example Use Cases

### Development Workflows

```bash
forge "create a new React component called UserProfile"
forge "run tests and fix any linting errors"
forge "build project and deploy to staging"
forge "generate API documentation from code comments"
```

### System Administration

```bash
forge "find and remove log files older than 7 days"
forge "check disk usage and clean up temp files"
forge "backup important directories to external drive"
forge "monitor system resources and alert if high usage"
```

### File Management

```bash
forge "organize photos by date into folders"
forge "compress all videos to save space"
forge "find duplicate files and remove them"
forge "sync documents folder with cloud storage"
```

## 🚨 Safety Guidelines

### Best Practices

1. **Review Plans** - Always review execution plans before approval
2. **Start Small** - Test with simple commands first
3. **Use Plan Mode** - Use `--plan-only` for complex operations
4. **Backup Data** - Ensure backups before destructive operations
5. **Monitor Logs** - Regularly check execution logs

### What Forge Won't Do

- Execute commands without user approval for high-risk operations
- Bypass security validations
- Run commands outside the configured sandbox
- Execute anything on the denylist
- Operate without proper API key configuration

## 🤝 Support

### Getting Help

- **Command Help**: `forge --help`
- **Status Check**: `forge status`
- **Configuration**: `forge config --show`
- **Recent Logs**: `forge logs --recent`

### Troubleshooting

| Issue | Solution |
|-------|----------|
| API key errors | Run `forge config` to set up API keys |
| Rate limits | Add multiple API keys for rotation |
| Permission errors | Check sandbox directory permissions |
| Command blocked | Review denylist configuration |
| High memory usage | Adjust sandbox memory limits |

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - For providing the AI capabilities
- **Node.js Community** - For excellent tooling and libraries
- **Security Researchers** - For best practices in command execution safety

---

**Made with ❤️ for developers who want AI-powered command-line assistance**

*Forge CLI - Redefining how you interact with your system through natural language*
