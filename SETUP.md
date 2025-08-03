# 🚀 Eleven CLI - Personal Setup Guide

## Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Install Globally on Your Laptop
```bash
npm link
```
This makes `el` command available everywhere on your system!

### Step 3: Get Your Free Gemini API Key
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API key"
3. Copy the key

### Step 4: Configure Eleven
```bash
el config
```
Paste your API key when prompted.

### Step 5: Test It Works
```bash
el ask "Hello Eleven!"
```

## 🎉 You're Ready!

Now you can use `el` from anywhere:
- VS Code terminal
- Command Prompt
- PowerShell
- Git Bash
- Any terminal on your laptop

## Quick Usage Examples

```bash
# Quick questions
el ask "How do I center a div in CSS?"
el "What's the difference between let and var?"

# Preset commands (super fast!)
el /write a Python web scraper
el /explain machine learning
el /debug my JavaScript code
el /fix this function

# Interactive chat
el chat

# Code generation
el code "create a REST API in Node.js"
el code -l python "create a todo app"

# Fix your files
el fix myfile.js
el rewrite myfile.py "make it more efficient"

# VS Code integration
el vscode --setup
```

## Pro Tips for Personal Use

### 1. Add Multiple API Keys (Avoid Rate Limits)
```bash
el config -a YOUR_SECOND_KEY
el config -a YOUR_THIRD_KEY
el config -r  # Enable rotation
```

### 2. Quick File Operations
```bash
# Fix any file instantly
el fix script.js "add error handling"

# Rewrite with requirements
el rewrite app.py "use async/await"

# Generate new files
el code -o newfile.js "create a login form"
```

### 3. VS Code Workflow
```bash
# Setup once
el vscode --setup

# Then use keyboard shortcuts:
# Ctrl+Alt+F - Fix current file
# Ctrl+Alt+R - Rewrite current file
# Ctrl+Alt+A - Analyze current file
```

### 4. All Preset Commands
```bash
el /help          # See all commands
el /about         # About Eleven
el /write         # Write code/docs
el /explain       # Explain concepts
el /suggest       # Get suggestions
el /modify        # Modify code
el /debug         # Debug issues
el /optimize      # Optimize code
el /review        # Code review
el /learn         # Learn concepts
el /fix           # Fix bugs
el /create        # Create projects
el /analyze       # Analyze code
```

## Troubleshooting

### If `el` command not found:
```bash
npm link
```

### If API errors:
```bash
el config --show  # Check your setup
el config -k NEW_KEY  # Update key
```

### If rate limits:
```bash
el config -a ADDITIONAL_KEY  # Add more keys
el config -r  # Enable rotation
```

## Uninstall (if needed)
```bash
npm unlink -g
```

---

**That's it! Eleven is now your personal AI assistant available everywhere on your laptop! 🎉**