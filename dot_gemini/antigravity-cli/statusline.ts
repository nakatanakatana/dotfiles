#!/usr/bin/env node

const BRAILLE = ' ⣀⣄⣤⣦⣶⣷⣿';
const R = '\x1b[0m';
const DIM = '\x1b[2m';
const CYAN_BOLD = '\x1b[1;36m';

const ICON_BG = '\u{f0ae}';       //  (Tasks)
const ICON_AGENTS = '\u{f06a9}';  // 󰚩 (Robot)
const ICON_ART = '\u{f03d6}';     // 󰏖 (Package)

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

function formatAgentState(state: string): string {
  const s = state.toLowerCase();
  let color = '\x1b[37m';
  let icon = '\u{f059}'; // 

  if (s === 'idle') {
    color = '\x1b[32m';    // Green
    icon = '\u{f0f4}';     //  (Coffee)
  } else if (s === 'thinking') {
    color = '\x1b[1;33m';  // Bold Yellow
    icon = '\u{f400}';     //  (Lightbulb)
  } else if (s === 'working') {
    color = '\x1b[1;33m';  // Bold Yellow
    icon = '\u{f120}';     //  (Terminal)
  } else if (s === 'tool_use') {
    color = '\x1b[1;35m';  // Bold Magenta
    icon = '\u{f0ad}';     //  (Wrench)
  }

  return `${color}${icon} ${state}${R}`;
}

function formatContext(pct: number): string {
  const p = Math.round(pct);
  return `${DIM}ctx${R} ${gradient(pct)}${brailleBar(pct)}${R} ${p}%`;
}

function getLength(str: string): number {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').length;
}

function getCountByStatus(items: any): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!items) return counts;

  if (Array.isArray(items)) {
    for (const item of items) {
      if (item && typeof item === 'object') {
        const status = item.status || item.state || 'unknown';
        counts[status] = (counts[status] || 0) + 1;
      } else if (typeof item === 'string') {
        counts[item] = (counts[item] || 0) + 1;
      }
    }
  } else if (typeof items === 'object') {
    for (const key of Object.keys(items)) {
      const val = items[key];
      if (typeof val === 'number') {
        counts[key] = val;
      } else if (val && typeof val === 'object') {
        const status = val.status || val.state || 'unknown';
        counts[status] = (counts[status] || 0) + 1;
      }
    }
  }
  return counts;
}

function formatMetric(label: string, items: any): string {
  const counts = getCountByStatus(items);
  const keys = Object.keys(counts);
  if (keys.length === 0) return '';
  
  const parts = keys.map(k => `${k}:${counts[k]}`);
  return `${DIM}${label}${R} [${parts.join(', ')}]`;
}

async function main(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const inputStr = Buffer.concat(chunks).toString('utf-8').trim();
  if (!inputStr) {
    process.stdout.write(`\x1b[32m\u{f0f4} idle${R} ${DIM}│${R} ${DIM}ctx${R} ${gradient(0)}${brailleBar(0)}${R} 0% ${CYAN_BOLD}[Unknown Model]${R}\n`);
    return;
  }

  try {
    const data = JSON.parse(inputStr);

    const modelName: string = data?.model?.display_name ?? 'Unknown Model';
    const modelPart = `${CYAN_BOLD}[${modelName}]${R}`;
    const modelLen = modelName.length + 2; // Includes brackets [ and ]

    // Workspace extraction (basename of project_dir or current_dir)
    const workspacePath = data?.workspace?.project_dir ?? data?.workspace?.current_dir;
    const workspaceName = workspacePath ? workspacePath.split('/').pop() : '';
    const workspacePart = workspaceName ? `${workspaceName} ` : '';

    // Version extraction (with 'v' prefix, styled with DIM)
    const versionRaw = data?.version;
    const versionText = versionRaw ? `v${versionRaw}` : '';
    const versionPart = versionText ? ` ${DIM}${versionText}${R}` : '';

    const rightPart = `${workspacePart}${modelPart}${versionPart}`;
    const rightLen = (workspaceName ? workspaceName.length + 1 : 0) +
                     modelLen +
                     (versionText ? versionText.length + 1 : 0);

    const state: string = data?.agent_state ?? 'unknown';
    const statePart = formatAgentState(state);

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

    // Format metrics (background tasks, subagents, artifacts)
    const bgPart = formatMetric(ICON_BG, data?.background_tasks ?? data?.tasks);
    const agentsPart = formatMetric(ICON_AGENTS, data?.subagents ?? data?.agents);
    const artifactsPart = formatMetric(ICON_ART, data?.artifacts);

    // Build line 1 (ctx, state, right-aligned model)
    const delimiter = ` ${DIM}│${R} `;
    const line1Left = `${statePart}${delimiter}${contextPart}`;
    const line1LeftLen = getLength(line1Left);
    const termWidth: number = data?.terminal_width ?? 80;
    const padding = termWidth - (line1LeftLen + rightLen);
    const spaces = padding > 0 ? ' '.repeat(padding) : '';
    const line1 = `${line1Left}${spaces}${rightPart}`;

    // Build line 2 (metrics)
    const line2Parts = [];
    if (bgPart) line2Parts.push(bgPart);
    if (agentsPart) line2Parts.push(agentsPart);
    if (artifactsPart) line2Parts.push(artifactsPart);

    if (line2Parts.length > 0) {
      const line2 = line2Parts.join(` ${DIM}│${R} `);
      process.stdout.write(`${line1}\n${line2}\n`);
    } else {
      process.stdout.write(`${line1}\n`);
    }
  } catch (e: any) {
    process.stderr.write(`Error: ${e.message}\n`);
  }
}

main();
