# Eleven - Personal AI CLI

Eleven is Slythnox's personal AI assistant - a powerful command-line interface powered by Google's Gemini AI.

## Features

- 💬 Interactive chat sessions with Eleven
- 💻 Code generation and analysis
- 📁 File analysis capabilities
- 🎨 Custom ASCII welcome message
- ⚙️ Easy configuration management
- 🚀 Global installation with "el" prefix
- 🔄 API key rotation to avoid rate limits
- ⚡ Preset commands for quick actions
- 🎯 Direct command execution

## Installation

### Method 1: Quick Setup
1. Download or clone this project to your laptop
2. Open terminal/cmd in the project folder
3. Install dependencies:
   ```bash
   npm install
   ```
4. Install globally to use anywhere on your PC:
   ```bash
   npm link
   ```
5. Verify installation:
   ```bash
   el --version
   ```

### Method 2: From Any Location
After installation, you can use `el` from any terminal, VS Code terminal, or Command Prompt anywhere on your system!

## Setup

1. Get your free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Configure the CLI:
   ```bash
   el config
   ```
   Or set it directly:
   ```bash
   el config -k YOUR_API_KEY
   ```

### API Rotation Setup (Recommended)
To avoid rate limits, add multiple API keys:
```bash
el config -k YOUR_FIRST_KEY      # Set primary key
el config -a YOUR_SECOND_KEY     # Add additional key
el config -a YOUR_THIRD_KEY      # Add more keys
el config -r                     # Enable rotation
```

## Usage

### Preset Commands (Quick Actions)
```bash
el /help                                    # Show all preset commands
el /about                                   # About Eleven
el /write a Python web scraper              # Write code
el /explain what is machine learning        # Explain concepts
el /suggest improvements for my React code  # Get suggestions
el /modify this function to be async        # Modify code
el /debug why my loop is infinite           # Debug issues
el /optimize this algorithm                 # Optimize code
el /review my JavaScript function          # Code review
el /learn about design patterns            # Learn concepts
```

### Direct Commands
```bash
el write a REST API in Node.js
el how do I center a div in CSS?
el explain recursion with examples
el create a React component for login
```

### Quick Questions
```bash
el ask "What is the difference between var and let in JavaScript?"
```

### Interactive Chat
```bash
el chat
```

### Single Message
```bash
el chat -m "Explain quantum computing in simple terms"
```

### Code Generation
```bash
el code "Create a Python function to calculate fibonacci numbers"
el code -l javascript "Create a REST API with Express"
```

### Code Analysis
```bash
el code -f myfile.js
el code -f script.py "Optimize this code for performance"
```

### Configuration
```bash
el config --show              # Show current settings
el config -k NEW_API_KEY      # Update primary API key
el config -a ADDITIONAL_KEY   # Add key for rotation
el config -r                  # Toggle API rotation
```

## Commands

- `el ask <question>` - Ask a quick question
- `el chat` - Start interactive chat
- `el code [prompt]` - Generate or analyze code
- `el config` - Manage configuration
- `el /help` - Show preset commands
- `el --help` - Show help

## Examples

```bash
# Quick question
el ask "How do I center a div in CSS?"

# Preset commands
el /write a todo app in React
el /explain async/await in JavaScript
el /debug my Python function

# Direct usage
el create a login form with validation
el how to deploy Node.js app to Heroku

# Generate code
el code "Create a React component for a todo list"

# Analyze a file
el code -f package.json "Explain this configuration"

# Interactive mode
el chat
```

## Installation on Your Laptop

1. **Download the project** to any folder on your laptop
2. **Open terminal/cmd** in that folder
3. **Run these commands:**
   ```bash
   npm install
   npm link
   ```
4. **Set up your API key:**
   ```bash
   el config
   ```
5. **Test it works:**
   ```bash
   el ask "Hello Eleven!"
   ```

Now you can use `el` from any terminal anywhere on your system - VS Code, Command Prompt, PowerShell, Git Bash, etc.!

## Rate Limit Management

The free Gemini API has these limits:
- 15 requests per minute
- 1 million tokens per minute  
- 1,500 requests per day

**Eleven automatically handles this by:**
- Tracking request counts
- Rotating between multiple API keys
- Warning when approaching limits
- Automatic retry with different keys

## Uninstallation

To remove the global CLI:
```bash
npm unlink -g
```

## License

MIT License