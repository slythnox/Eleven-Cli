# 🤖 Eleven - Your Personal AI Assistant

**Eleven** is your personal AI assistant - a powerful command-line interface that works everywhere on your laptop!

## ✨ What Can Eleven Do?

- 💬 **Chat with AI** - Ask anything, get instant answers
- 💻 **Generate Code** - Create functions, apps, scripts in any language
- 🔧 **Fix Your Files** - Automatically fix bugs and improve code
- 📝 **Rewrite Code** - Transform code with new requirements
- ⚡ **Preset Commands** - Super fast actions with `/` commands
- 🎯 **Direct Questions** - Just type and get answers
- 🔄 **Smart Rate Limits** - Multiple API keys, automatic rotation
- 🎨 **VS Code Integration** - Seamless workflow with your editor

## 🚀 Quick Setup (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Make it global (use 'el' anywhere!)
npm link

# 3. Setup your API key
el config

# 4. Test it works
el ask "Hello!"
```

**That's it! Now use `el` from any terminal on your laptop! 🎉**

## 🎯 How to Use Eleven

### Super Fast Preset Commands
```bash
el /write a Python web scraper
el /explain machine learning  
el /debug my JavaScript code
el /fix this function
el /help  # See all preset commands
```

### Ask Anything Directly
```bash
el "How do I center a div in CSS?"
el "Create a REST API in Node.js"
el "What's the difference between let and var?"
```

### Fix Your Files Instantly
```bash
el fix myfile.js
el fix script.py "add error handling"
el rewrite app.js "use modern ES6 syntax"
```

### Generate New Code
```bash
el code "create a login form with validation"
el code -l python "create a web scraper"
el code -o newfile.js "create a todo app"
```

### Interactive Mode
```bash
el chat  # Start chatting
el ask "your question"  # Quick question
```

## 🔥 Pro Tips

### Multiple API Keys (Avoid Rate Limits)
```bash
el config -a YOUR_SECOND_KEY
el config -a YOUR_THIRD_KEY  
el config -r  # Enable auto-rotation
```

### VS Code Integration
```bash
el vscode --setup  # Setup once
# Then use Ctrl+Alt+F to fix current file!
```

## 📚 All Commands

| Command | What it does |
|---------|-------------|
| `el ask "question"` | Quick questions |
| `el chat` | Interactive chat |
| `el code "prompt"` | Generate code |
| `el fix file.js` | Fix file issues |
| `el rewrite file.py` | Rewrite file |
| `el config` | Setup/manage config |
| `el /help` | All preset commands |
| `el vscode --setup` | VS Code integration |

## 🎨 Real Examples

```bash
# Quick help
el "How do I deploy to Heroku?"

# Code generation  
el code "create a React todo component"

# Fix your messy code
el fix messy-script.js "clean it up and add comments"

# Preset magic
el /write a todo app in React
el /explain async/await
el /optimize this algorithm

# Interactive mode
el chat
> "Help me build a web scraper"
> "Now make it handle errors"
> "exit"
```

## 🛠️ Configuration

```bash
el config --show     # See current setup
el config -k NEW_KEY # Update API key  
el config -a EXTRA_KEY # Add more keys
el config -r         # Toggle rotation
```

## 🔧 Get Your API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API key" 
3. Copy and paste in `el config`

**It's free!** 🎉

## 🚨 Troubleshooting

```bash
# Command not found?
npm link

# API errors?
el config --show
el config -k YOUR_NEW_KEY

# Rate limits?
el config -a SECOND_KEY
el config -r
```

## 🗑️ Uninstall

```bash
npm unlink -g
```

---

## 💡 Why Eleven?

- **Always Available** - Works in any terminal, anywhere on your laptop
- **Lightning Fast** - Preset commands for instant results  
- **Smart & Safe** - Automatic backups, error handling, rate limit management
- **Your Workflow** - Integrates with VS Code, fixes your actual files
- **Personal** - Made for developers, by developers

**Eleven is your coding companion that's always ready to help! 🚀**

---

**Made with ❤️ for developers who want AI assistance everywhere on their laptop!**

## 📄 License

MIT License