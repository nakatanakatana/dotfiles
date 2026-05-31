#!/usr/bin/env node

async function main(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const inputStr = Buffer.concat(chunks).toString('utf-8').trim();
  if (!inputStr) {
    process.stdout.write('\u{f0f4} agy\n');
    return;
  }

  try {
    const data = JSON.parse(inputStr);
    const state: string = (data?.agent_state ?? 'unknown').toLowerCase();
    
    let icon = '\u{f059}'; // 

    if (state === 'idle') {
      icon = '\u{f0f4}';     // 
    } else if (state === 'thinking') {
      icon = '\u{f400}';     // 
    } else if (state === 'working') {
      icon = '\u{f120}';     // 
    } else if (state === 'tool_use') {
      icon = '\u{f0ad}';     // 
    }

    process.stdout.write(`${icon} agy\n`);
  } catch (e) {
    process.stdout.write('\u{f0f4} agy\n');
  }
}

main();
