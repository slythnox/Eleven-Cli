# 🤖 Eleven CLI - Your Personal AI Assistant

**Eleven** is a powerful command-line AI assistant that brings the power of Google Gemini AI directly to your terminal. Built specifically for developers who want instant AI assistance without leaving their workflow.

## ✨ Features

- 💬 **Interactive Chat** - Have conversations with AI directly in your terminal
- 💻 **Code Generation** - Create functions, scripts, and entire applications
- 🔧 **File Operations** - Fix, rewrite, and analyze your existing code files
- ⚡ **Preset Commands** - Quick actions with `/` shortcuts for common tasks
- 🔄 **Smart Rate Limiting** - Multiple API key support with automatic rotation
- 🎯 **Direct Questions** - Ask anything and get instant answers
- 📁 **File Context** - Include files in your conversations for better assistance
- 🛠️ **VS Code Integration** - Seamless workflow with your favorite editor

## 🚀 Quick Installation

```bash
# 1. Install dependencies
npm install

# 2. Make it globally available
npm link

# 3. Configure your API key
el config

# 4. Test it works
el ask "Hello!"
```

**That's it! Now use `el` from anywhere on your system! 🎉**

## 🔑 Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API key"
3. Copy the generated key
4. Run `el config` and paste your key

**It's completely free to get started!**

## 📖 Usage Guide

### Quick Questions
```bash
el ask "How do I center a div in CSS?"
el "What's the difference between let and var?"
el "Explain async/await in JavaScript"
```

### Preset Commands (Super Fast!)
```bash
el /write a Python web scraper
el /explain machine learning basics
el /debug my infinite loop problem
el /optimize this sorting algorithm
el /help  # See all available presets
```

### File Operations
```bash
# Fix issues in your code
el fix myfile.js
el fix script.py "add error handling"

# Completely rewrite files
el rewrite app.js "use modern ES6 syntax"
el rewrite old-code.py "make it more efficient"

# Generate new files
el code "create a REST API" -o server.js
el code -l python "web scraper" -o scraper.py
```

### Interactive Chat
```bash
el chat  # Start a conversation
# Type your questions, type 'exit' to quit
```

### File Analysis
```bash
el code -f myfile.js  # Analyze and explain code
el code -f script.py "how can I improve this?"
```

## 🎯 Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `el ask "question"` | Quick questions | `el ask "How to deploy to Heroku?"` |
| `el chat` | Interactive chat session | `el chat` |
| `el fix <file>` | Fix issues in file | `el fix buggy-script.js` |
| `el rewrite <file>` | Rewrite file completely | `el rewrite old-code.py` |
| `el code "prompt"` | Generate new code | `el code "todo app" -o app.js` |
| `el config` | Setup/manage configuration | `el config` |
| `el health` | Check system health | `el health` |
| `el /help` | Show preset commands | `el /help` |

## 🔥 Advanced Features

### Multiple API Keys (Avoid Rate Limits)
```bash
el config -a YOUR_SECOND_KEY    # Add additional key
el config -a YOUR_THIRD_KEY     # Add more keys
el config -r                    # Enable auto-rotation
```

### File Context in Conversations
```bash
el ask "explain this code" -f myfile.js
el chat -f config.json  # Include file in chat
```

### Preview Changes Before Applying
```bash
el fix myfile.js --preview      # See changes first
el rewrite app.py --preview     # Preview rewrite
```

### VS Code Integration
```bash
el vscode --setup               # Setup once
# Then use Ctrl+Shift+P → "Tasks: Run Task" → "Eleven: Fix Current File"
```

## ⚙️ Configuration

### View Current Settings
```bash
el config --show     # See all settings
el health           # Check API connectivity
```

### Manage API Keys
```bash
el config -k NEW_KEY        # Set primary API key
el config -a EXTRA_KEY      # Add key for rotation
el config -r               # Toggle rotation on/off
```

### Advanced Settings
```bash
el config --model gemini-1.5-pro    # Change AI model
el config --temp 0.9                # Adjust creativity
el config --tokens 4096             # Set max response length
```

## 🛠️ Troubleshooting

### Command Not Found?
```bash
npm link                    # Make command globally available
```

### API Errors?
```bash
el config --show           # Check your configuration
el health                  # Test API connectivity
el config -k YOUR_NEW_KEY  # Update API key
```

### Rate Limits?
```bash
el config -a SECOND_KEY    # Add more API keys
el config -r              # Enable rotation
```

### Still Having Issues?
```bash
node debug-test.js        # Run diagnostic test
el config --reset         # Reset to defaults
```

## 📁 Project Structure

```
eleven-cli/
├── bin/eleven.js          # Main CLI entry point
├── src/
│   ├── commands/          # Command handlers
│   ├── services/          # AI service integration
│   ├── config/           # Configuration management
│   └── utils/            # Helper utilities
├── package.json
└── README.md
```

## 🎨 Real-World Examples

### Web Development
```bash
el /write a React component for user authentication
el fix api-routes.js "add proper error handling"
el code "Express.js middleware for CORS" -o middleware.js
```

### Python Development
```bash
el /write a data analysis script using pandas
el rewrite old-scraper.py "make it async and faster"
el ask "best practices for Python error handling"
```

### General Programming
```bash
el /explain the difference between SQL and NoSQL
el /debug why my algorithm is O(n²) instead of O(n)
el /optimize this database query
```

### Learning & Research
```bash
el ask "explain microservices architecture"
el /learn about machine learning algorithms
el chat  # Start learning conversation
```

## 🔒 Privacy & Security

- **API Keys**: Stored locally in `~/.eleven-cli/config.json`
- **No Data Collection**: Your conversations stay between you and Google's API
- **Local Processing**: All file operations happen on your machine
- **Open Source**: Full source code available for inspection

## 🤝 Contributing

Found a bug or want to add a feature?

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this in your own projects!

## 🙏 Acknowledgments

- **Google Gemini AI** - For providing the powerful AI capabilities
- **Node.js Community** - For the excellent CLI libraries
- **You** - For using Eleven and making it better!

---

**Made with ❤️ by Slythnox**

*Eleven CLI - Because every developer deserves an AI assistant that actually works!*

## 🆘 Need Help?

- **Quick Help**: `el --help`
- **All Presets**: `el /help`
- **Health Check**: `el health`
- **Configuration**: `el config --show`
- **Issues**: [GitHub Issues](https://github.com/slythnox/eleven-cli/issues)

**Happy coding! 🚀**