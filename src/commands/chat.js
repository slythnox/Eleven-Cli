import { Command } from 'commander';
import prompts from 'prompts';
import { gemini } from '../services/geminiService.js';
import readline from 'readline';

export function chatCommand() {
  const cmd = new Command('chat');
  cmd.description('Start an interactive chat session');

  cmd.action(async () => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    console.log('Gemini chat — type "exit" to quit');
    const history = [{ role: 'system', content: 'You are Eleven — helpful coding assistant.' }];

    for await (const line of rl) {
      const trimmed = (line || '').trim();
      if (!trimmed) continue;
      if (trimmed.toLowerCase() === 'exit') {
        rl.close();
        break;
      }
      history.push({ role: 'user', content: trimmed });
      process.stdout.write('...thinking...\n');
      try {
        const res = await gemini.chatGenerate(history);
        console.log('\n' + (res?.text || JSON.stringify(res)));
        history.push({ role: 'assistant', content: res?.text || (res?.output || JSON.stringify(res)) });
        process.stdout.write('> ');
      } catch (err) {
        console.error('Error:', err?.message || err);
      }
    }
  });

  return cmd;
}
