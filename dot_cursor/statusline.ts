#!/usr/bin/env -S node --experimental-strip-types

const BRAILLE = ' ⣀⣄⣤⣦⣶⣷⣿';
const R = '\x1b[0m';
const DIM = '\x1b[2m';
const WHITE = '\x1b[37m';
const GRAY = '\x1b[38;5;245m'; // medium-dark gray
const ICON_CTX = String.fromCodePoint(0xf035b); // 󰍛 (nf-md-chip)
const ICON_MODE_ACCEPT = String.fromCodePoint(0xf140b); // 󱐋 (nf-md-lightning_bolt)
const ICON_MODE_DEFAULT = String.fromCodePoint(0xf0498); // 󰒘 (nf-md-shield_check)

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

function fmt(pct: number): string {
  const p = Math.round(pct);
  return `${WHITE}${ICON_CTX}${R} ${gradient(pct)}${brailleBar(pct)}${R} ${p}%`;
}

function formatAutorun(autorun: boolean): string {
  if (autorun) {
    // antigravity accept-edits
    return `\x1b[1;32m${ICON_MODE_ACCEPT} autorun${R}`;
  }
  // antigravity default
  return `\x1b[37m${ICON_MODE_DEFAULT} allowlist${R}`;
}

function getContextPercent(cw: Record<string, unknown> | undefined): number {
  if (!cw) return 0;
  if (cw.used_percentage != null) return Number(cw.used_percentage);
  const used = cw.total_input_tokens;
  const limit = cw.context_window_size;
  if (used != null && limit) return (Number(used) / Number(limit)) * 100;
  if (cw.remaining_percentage != null) return 100 - Number(cw.remaining_percentage);
  return 0;
}

function visibleWidth(s: string): number {
  return s.replace(/\x1b\[[0-9;]*m/g, '').length;
}

async function main(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const data = JSON.parse(Buffer.concat(chunks).toString('utf-8'));

  const model: string = data?.model?.display_name ?? 'Cursor';
  const parts: string[] = [model];

  parts.push(formatAutorun(Boolean(data?.autorun)));
  parts.push(fmt(getContextPercent(data?.context_window)));

  const left = parts.join(` ${DIM}│${R} `);
  const name: string | undefined = data?.session_name;
  if (!name) {
    process.stdout.write(left);
    return;
  }

  const width: number = data?.render_width_chars ?? 80;
  const right = `${GRAY}${name}${R}`;
  const gap = Math.max(1, width - visibleWidth(left) - visibleWidth(right));
  process.stdout.write(left + ' '.repeat(gap) + right);
}

main();
