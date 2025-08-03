const path = require("path");
const chalk = require("chalk");

function formatResponse(text) {
  // Simple formatting for better readability
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return (
        chalk.gray("\n┌─────────────────────────────────────\n") +
        chalk.yellow(code.trim()) +
        chalk.gray("\n└─────────────────────────────────────\n")
      );
    })
    .replace(/\*\*(.*?)\*\*/g, chalk.bold("$1"))
    .replace(/\*(.*?)\*/g, chalk.italic("$1"));
}

function validateApiKey(apiKey) {
  // Basic validation for Gemini API key format
  return apiKey && apiKey.length > 10 && apiKey.startsWith("AI");
}

function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

function isCodeFile(filePath) {
  const codeExtensions = [
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".cs",
    ".php",
    ".rb",
    ".go",
    ".rs",
    ".swift",
    ".kt",
    ".dart",
    ".html",
    ".css",
    ".scss",
    ".json",
    ".xml",
    ".sql",
    ".sh",
    ".bat",
  ];

  const ext = getFileExtension(filePath);
  return codeExtensions.includes(ext);
}

module.exports = {
  formatResponse,
  validateApiKey,
  getFileExtension,
  isCodeFile,
};
