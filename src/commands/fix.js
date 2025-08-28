import { Command } from 'commander';
import fs from 'fs-extra';
import { gemini } from '../services/geminiService.js';
import ora from 'ora';

export function fixCommand() {
  const cmd = new Command('fix');
  cmd
    .description('Send a file to Eleven to suggest fixes (will not overwrite unless --apply)')
    .argument('<file>', 'file path')
    .option('--apply', 'Apply changes automatically')
    .option('-m, --msg <message>', 'Describe the fix you want', 'Please fix issues and improve code quality.');

  cmd.action(async (file, opts) => {
    if (!fs.existsSync(file)) {
      console.error('File not found:', file);
      process.exitCode = 1;
      return;
    }
    const code = await fs.readFile(file, 'utf8');
    const prompt = `${opts.msg}\n\nFile: ${file}\n\n\`\`\`\n${code}\n\`\`\``;
    const spinner = ora('Analyzing file...').start();
    try {
      const suggestion = await gemini.generateText(prompt, { maxTokens: 1200 });
      spinner.succeed('Done');
      console.log('--- Suggestion ---\n', suggestion);
      if (opts.apply) {
        // Naive: expect gemini returns full updated file between code fences.
        const match = suggestion.match(/```(?:[\s\S]*?)\n([\s\S]*?)```/);
        const newCode = match ? match[1].trim() : suggestion;
        await fs.writeFile(file, newCode, 'utf8');
        console.log('Applied changes to', file);
      }
    } catch (err) {
      spinner.fail('Error');
      console.error(err?.message || err);
    }
  });

  return cmd;
}
