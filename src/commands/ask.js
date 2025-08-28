import { Command } from 'commander';
import { gemini } from '../services/geminiService.js';
import ora from 'ora';

export function askCommand() {
  const cmd = new Command('ask');
  cmd
    .description('Ask a quick question (non-interactive)')
    .argument('<prompt...>', 'Prompt text')
    .option('-t, --temp <n>', 'Temperature', parseFloat)
    .option('-m, --max <n>', 'Max tokens', parseInt);

  cmd.action(async (promptParts, opts) => {
    const prompt = promptParts.join(' ');
    const spinner = ora('Sending to Gemini...').start();
    try {
      const out = await gemini.generateText(prompt, { temp: opts.temp, maxTokens: opts.max });
      spinner.succeed('Done');
      console.log(out);
    } catch (err) {
      spinner.fail('Error');
      console.error(err?.message || err);
      process.exitCode = 1;
    }
  });

  return cmd;
}
