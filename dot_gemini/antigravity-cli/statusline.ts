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

function formatAgentMode(mode: string): string {
  const m = mode.toLowerCase();
  let color = '\x1b[33m';
  let icon = '';

  if (m === 'accept-edits') {
    color = '\x1b[1;32m'; // Bold Green
    icon = '⚡ ';
  } else if (m === 'plan') {
    color = '\x1b[1;34m'; // Bold Blue
    icon = '📋 ';
  } else if (m === 'default' || m === 'request-review') {
    color = '\x1b[37m';   // White
    icon = '🛡️ ';
  }

  return `${color}${icon}${mode}${R}`;
}

function resolveAgentMode(data: any): string {
  if (typeof data?.cycle_mode === 'string' && data.cycle_mode.trim()) {
    return data.cycle_mode;
  }
  if (typeof data?.execution_mode === 'string' && data.execution_mode.trim()) {
    return data.execution_mode;
  }
  if (typeof data?.agent_mode === 'string' && data.agent_mode.trim()) {
    return data.agent_mode;
  }
  if (typeof data?.agentMode === 'string' && data.agentMode.trim()) {
    return data.agentMode;
  }
  return 'default';
}

function formatContext(pct: number): string {
  const p = Math.round(pct);
  return `${DIM}ctx${R} ${gradient(pct)}${brailleBar(pct)}${R} ${p}%`;
}

function formatQuota(label: string, remainingFraction: number, resetInSeconds: number, resetTime: string): string {
  const usedPct = (1 - remainingFraction) * 100;
  const pct = Math.round(usedPct);
  const remainingMs = resetInSeconds !== undefined && resetInSeconds !== null
    ? resetInSeconds * 1000
    : (new Date(resetTime).getTime() - Date.now());
  
  let resetStr = '';
  if (remainingMs < 24 * 60 * 60 * 1000) {
    const totalMins = Math.round(remainingMs / (60 * 1000));
    const remainingHours = Math.floor(totalMins / 60);
    const remainingMins = totalMins % 60;
    if (remainingHours > 0) {
      if (remainingMins > 0) {
        resetStr = `in ${remainingHours}h ${remainingMins}m`;
      } else {
        resetStr = `in ${remainingHours}h`;
      }
    } else {
      resetStr = `in ${remainingMins}m`;
    }
  } else {
    const resetsDate = new Date(Date.now() + remainingMs);
    const month = String(resetsDate.getMonth() + 1).padStart(2, '0');
    const date = String(resetsDate.getDate()).padStart(2, '0');
    const hours = String(resetsDate.getHours()).padStart(2, '0');
    const minutes = String(resetsDate.getMinutes()).padStart(2, '0');
    resetStr = `@ ${month}-${date} ${hours}:${minutes}`;
  }

  return `${DIM}${label}${R} ${gradient(usedPct)}${brailleBar(usedPct)}${R} ${pct}% (${resetStr})`;
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

interface StatusInfo {
  order: number;
  category: 'pending' | 'running' | 'stopped' | 'other';
}

const STATUS_MAP: Record<string, StatusInfo> = {
  // 開始待ち
  pending: { order: 10, category: 'pending' },
  queued: { order: 11, category: 'pending' },
  waiting: { order: 12, category: 'pending' },
  starting: { order: 13, category: 'pending' },
  initializing: { order: 14, category: 'pending' },

  // 実行中
  running: { order: 20, category: 'running' },
  working: { order: 21, category: 'running' },
  active: { order: 22, category: 'running' },
  in_progress: { order: 23, category: 'running' },
  processing: { order: 24, category: 'running' },
  thinking: { order: 25, category: 'running' },

  // 停止 (完了・失敗等)
  completed: { order: 30, category: 'stopped' },
  done: { order: 31, category: 'stopped' },
  success: { order: 32, category: 'stopped' },
  succeeded: { order: 33, category: 'stopped' },
  finished: { order: 34, category: 'stopped' },
  failed: { order: 35, category: 'stopped' },
  error: { order: 36, category: 'stopped' },
  cancelled: { order: 37, category: 'stopped' },
  canceled: { order: 38, category: 'stopped' },
  stopped: { order: 39, category: 'stopped' },
  idle: { order: 40, category: 'stopped' },
};

const CATEGORY_ICONS: Record<string, string> = {
  pending: '\u{f04a0}', // 󰥔 (Timer)
  running: '\u{f120}',  //  (Terminal)
  stopped: '\u{f00c}',  //  (Check)
  other: '\u{f059}',    //  (Question)
};

function getStatusInfo(status: string): StatusInfo {
  const s = status.toLowerCase();
  return STATUS_MAP[s] ?? { order: 100, category: 'other' };
}

function compareStatuses(a: string, b: string): number {
  const infoA = getStatusInfo(a);
  const infoB = getStatusInfo(b);
  if (infoA.order !== infoB.order) {
    return infoA.order - infoB.order;
  }
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

function formatMetric(label: string, items: any): string {
  const counts = getCountByStatus(items);
  const keys = Object.keys(counts).sort(compareStatuses);
  if (keys.length === 0) return '';
  
  let lastCategory: string | null = null;
  const parts: string[] = [];

  for (const k of keys) {
    const info = getStatusInfo(k);
    if (info.category !== lastCategory) {
      const icon = CATEGORY_ICONS[info.category] || CATEGORY_ICONS.other;
      parts.push(`${icon} ${k}:${counts[k]}`);
      lastCategory = info.category;
    } else {
      parts.push(`${k}:${counts[k]}`);
    }
  }

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

    const agentMode = resolveAgentMode(data);
    const modePart = agentMode ? formatAgentMode(agentMode) : '';

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
    const quotaParts: string[] = [];
    const q5h = data?.quota?.['gemini-5h'] ?? data?.quota?.['3p-5h'];
    const qWeekly = data?.quota?.['gemini-weekly'] ?? data?.quota?.['3p-weekly'];

    if (q5h) {
      quotaParts.push(formatQuota('5h', q5h.remaining_fraction, q5h.reset_in_seconds, q5h.reset_time));
    }
    if (qWeekly) {
      quotaParts.push(formatQuota('7d', qWeekly.remaining_fraction, qWeekly.reset_in_seconds, qWeekly.reset_time));
    }

    let line1Left = modePart ? `${statePart}${delimiter}${modePart}${delimiter}${contextPart}` : `${statePart}${delimiter}${contextPart}`;
    if (quotaParts.length > 0) {
      line1Left += `${delimiter}${quotaParts.join(delimiter)}`;
    }
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
