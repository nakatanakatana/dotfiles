#!/usr/bin/env node

const BRAILLE = ' ⣀⣄⣤⣦⣶⣷⣿';
const R = '\x1b[0m';
const DIM = '\x1b[2m';
const CYAN_BOLD = '\x1b[1;36m';

function gradient(pct: number): string {
  if (pct < 50) {
    const r = Math.round(pct * 5.1);
    return `\x1b[38;2;${r};200;80m`;
  } else {
    const g = Math.round(200 - (pct - 50) * 4);
    return `\x1b[38;2;255;${Math.max(g, 0)};60m`;
  }
}

function brailleBar(pct: number, width = 8): string {
  pct = Math.min(Math.max(pct, 0), 100);
  const level = pct / 100;
  let bar = '';
  for (let i = 0; i < width; i++) {
    const segStart = i / width;
    const segEnd = (i + 1) / width;
    if (level >= segEnd) {
      bar += BRAILLE[7];
    } else if (level <= segStart) {
      bar += BRAILLE[0];
    } else {
      const frac = (level - segStart) / (segEnd - segStart);
      bar += BRAILLE[Math.min(Math.floor(frac * 7), 7)];
    }
  }
  return bar;
}

function getAgentStateColor(state: string): string {
  state = state.toLowerCase();
  if (state === 'idle') {
    return '\x1b[32m'; // Green
  } else if (state === 'thinking' || state === 'working') {
    return '\x1b[1;33m'; // Bold Yellow
  } else if (state === 'tool_use') {
    return '\x1b[1;35m'; // Bold Magenta
  } else {
    return '\x1b[37m'; // White
  }
}

function formatContext(pct: number): string {
  const p = Math.round(pct);
  return `${DIM}ctx${R} ${gradient(pct)}${brailleBar(pct)}${R} ${p}%`;
}

function getLength(str: string): number {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').length;
}

async function main(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const inputStr = Buffer.concat(chunks).toString('utf-8').trim();
  if (!inputStr) {
    process.stdout.write(`${DIM}ctx${R} ${gradient(0)}${brailleBar(0)}${R} 0% ${DIM}│${R} \x1b[32midle${R} ${CYAN_BOLD}[Unknown Model]${R}\n`);
    return;
  }

  try {
    const data = JSON.parse(inputStr);

    const modelName: string = data?.model?.display_name ?? 'Unknown Model';
    const modelPart = `${CYAN_BOLD}[${modelName}]${R}`;
    const modelLen = modelName.length + 2; // Includes brackets [ and ]

    const state: string = data?.agent_state ?? 'unknown';
    const stateColor = getAgentStateColor(state);
    const statePart = `${stateColor}${state}${R}`;
    const stateLen = state.length;

    // Context Percentage
    let pct = data?.context_window?.used_percentage ?? data?.context?.used_percentage;
    if (pct === undefined || pct === null) {
      const used = data?.context_window?.used_tokens ?? data?.context_window?.used ?? data?.context?.used;
      const limit = data?.context_window?.max_tokens ?? data?.context_window?.limit ?? data?.context?.limit;
      if (used !== undefined && used !== null && limit) {
        pct = (used / limit) * 100.0;
      } else {
        pct = 0.0;
      }
    }

    const contextPart = formatContext(pct);
    const contextLen = getLength(contextPart);

    const termWidth: number = data?.terminal_width ?? 80;
    const delimiter = ` ${DIM}│${R} `;
    const delimiterLen = 3; // " │ " is 3 display columns

    const usedWidth = contextLen + delimiterLen + stateLen + modelLen;
    const padding = termWidth - usedWidth;
    const spaces = padding > 0 ? ' '.repeat(padding) : '';

    process.stdout.write(`${contextPart}${delimiter}${statePart}${spaces}${modelPart}\n`);
  } catch (e: any) {
    process.stderr.write(`Error: ${e.message}\n`);
  }
}

main();
