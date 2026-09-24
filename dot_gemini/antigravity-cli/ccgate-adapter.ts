#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export interface PreToolUsePayload {
  toolCall?: {
    name: string;
    args?: {
      CommandLine?: string;
      [key: string]: any;
    };
  };
  stepIdx?: number;
  conversationId?: string;
  workspacePaths?: string[];
  transcriptPath?: string;
}

export interface ParsedInput {
  toolName: string;
  commandLine: string;
  cwd: string;
  transcriptPath?: string;
  conversationId?: string;
}

export interface CcgateResult {
  // Devin or flat format
  decision?: 'allow' | 'deny' | 'fallthrough' | string;
  reason?: string;
  deny_message?: string;

  // Claude Code and Codex nested format
  hookSpecificOutput?: {
    hookEventName?: string;
    decision?: {
      behavior?: 'allow' | 'deny' | 'fallthrough' | string;
      message?: string;
    };
  };
}

export interface PreToolUseOutput {
  decision: 'allow' | 'deny' | 'ask' | 'force_ask';
  reason?: string;
}

export function parseAntigravityInput(inputStr: string): ParsedInput {
  try {
    const data: PreToolUsePayload = JSON.parse(inputStr);
    return {
      toolName: data.toolCall?.name ?? '',
      commandLine: data.toolCall?.args?.CommandLine ?? '',
      cwd: data.workspacePaths?.[0] ?? process.cwd(),
      transcriptPath: data.transcriptPath,
      conversationId: data.conversationId,
    };
  } catch {
    return {
      toolName: '',
      commandLine: '',
      cwd: process.cwd(),
    };
  }
}

export function mapCcgateDecision(ccgateOutput: CcgateResult | null | undefined): PreToolUseOutput {
  if (!ccgateOutput || typeof ccgateOutput !== 'object') {
    return { decision: 'ask', reason: 'Invalid or missing ccgate output' };
  }

  // Resolve behavior and reason from nested hookSpecificOutput or flat decision
  const nested = ccgateOutput.hookSpecificOutput?.decision;
  const behavior = nested?.behavior ?? ccgateOutput.decision;
  const message = nested?.message ?? ccgateOutput.deny_message ?? ccgateOutput.reason;

  if (behavior === 'allow') {
    return { decision: 'allow', reason: message };
  }
  if (behavior === 'deny') {
    return {
      decision: 'deny',
      reason: message ?? 'Blocked by ccgate',
    };
  }
  // 'fallthrough' or any unknown status falls back to asking the user
  return {
    decision: 'ask',
    reason: message ?? 'ccgate fallthrough / uncertainty',
  };
}


export function convertAgyTranscriptToClaude(agyContent: string): string[] {
  const result: string[] = [];
  const lines = agyContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const entry = JSON.parse(trimmed);
      if (entry.type === 'USER_INPUT' && typeof entry.content === 'string' && entry.content.trim()) {
        result.push(
          JSON.stringify({
            type: 'user',
            message: {
              role: 'user',
              content: entry.content,
            },
          })
        );
      } else if (Array.isArray(entry.tool_calls)) {
        for (const tc of entry.tool_calls) {
          if (tc && typeof tc.name === 'string') {
            result.push(
              JSON.stringify({
                type: 'tool_call',
                tool_name: tc.name,
              })
            );
          }
        }
      }
    } catch {
      // Ignore malformed JSON lines
      continue;
    }
  }

  return result;
}

export function extractAllowedPrefixes(allowRules: string[]): string[] {
  const prefixes: string[] = [];
  for (const rule of allowRules) {
    const match = rule.match(/^command\((.+)\)$/);
    if (match) {
      prefixes.push(match[1].trim());
    }
  }
  return prefixes;
}

export function hasShellOperators(commandLine: string): boolean {
  // Check for pipes, backgrounding, chaining, redirections, or command substitutions
  return /(\||&&|\|\||;|>>|>|<|\$\(|`)/.test(commandLine);
}

export function isCommandAllowed(commandLine: string, allowedPrefixes: string[]): boolean {
  if (hasShellOperators(commandLine)) {
    return false;
  }
  const trimmed = commandLine.trim();
  for (const prefix of allowedPrefixes) {
    if (trimmed === prefix || trimmed.startsWith(prefix + ' ') || trimmed.startsWith(prefix + '\t')) {
      return true;
    }
  }
  return false;
}

export function loadSettingsPermissions(): string[] {
  try {
    const homeDir = os.homedir();
    const settingsPath = process.env.AGY_SETTINGS_PATH || path.join(homeDir, '.gemini', 'antigravity-cli', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const raw = fs.readFileSync(settingsPath, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.permissions?.allow)) {
        return extractAllowedPrefixes(data.permissions.allow);
      }
    }
  } catch {
    // Ignore read/parse errors
  }
  return [];
}

export function executeCcgate(
  target: string,
  payload: Record<string, any>
): CcgateResult {
  const child = spawnSync('ccgate', [target], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
    timeout: 25000,
  });

  if (child.error) {
    return {
      decision: 'fallthrough',
      reason: `ccgate execution error: ${child.error.message}`,
    };
  }

  if (child.status !== 0) {
    const errText = child.stderr?.trim() || `Exit code ${child.status}`;
    return {
      decision: 'fallthrough',
      reason: `ccgate exited with error: ${errText}`,
    };
  }

  const stdout = child.stdout?.trim();
  if (!stdout) {
    // When ccgate falls through, Claude hook contract emits empty stdout
    return {
      decision: 'fallthrough',
      reason: 'ccgate fallthrough / uncertainty',
    };
  }

  try {
    return JSON.parse(stdout);
  } catch (e: any) {
    return {
      decision: 'fallthrough',
      reason: `Failed to parse ccgate stdout: ${e.message}`,
    };
  }
}

async function main(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const inputStr = Buffer.concat(chunks).toString('utf-8').trim();

  if (!inputStr) {
    outputResult({ decision: 'ask', reason: 'Empty input received' });
    return;
  }

  const parsed = parseAntigravityInput(inputStr);

  // If tool is not run_command, allow execution by default
  if (parsed.toolName !== 'run_command' || !parsed.commandLine.trim()) {
    outputResult({ decision: 'allow' });
    return;
  }

  // If command is allowed by settings.json permissions and has no shell operators (pipes/chaining),
  // bypass ccgate and allow immediately (mirroring Claude Code PermissionRequest behavior).
  const allowedPrefixes = loadSettingsPermissions();
  if (isCommandAllowed(parsed.commandLine, allowedPrefixes)) {
    outputResult({ decision: 'allow', reason: 'Pre-approved by permissions settings' });
    return;
  }

  const target = process.env.CCGATE_TARGET || 'claude';
  let tempTranscriptFile: string | null = null;

  try {
    const ccgatePayload: Record<string, any> = {
      tool_name: 'Bash',
      tool_input: {
        command: parsed.commandLine,
      },
      cwd: parsed.cwd,
    };

    if (target === 'claude' && parsed.transcriptPath && fs.existsSync(parsed.transcriptPath)) {
      try {
        const agyContent = fs.readFileSync(parsed.transcriptPath, 'utf-8');
        const claudeLines = convertAgyTranscriptToClaude(agyContent);
        if (claudeLines.length > 0) {
          const tempDir = os.tmpdir();
          const fileName = `ccgate-trans-${parsed.conversationId || Date.now()}.jsonl`;
          tempTranscriptFile = path.join(tempDir, fileName);
          fs.writeFileSync(tempTranscriptFile, claudeLines.join('\n') + '\n', 'utf-8');
          ccgatePayload.transcript_path = tempTranscriptFile;
        }
      } catch (err: any) {
        // Transcript conversion failure is non-fatal; continue without transcript
      }
    }

    const ccgateResult = executeCcgate(target, ccgatePayload);
    const mapped = mapCcgateDecision(ccgateResult);
    outputResult(mapped);
  } catch (e: any) {
    outputResult({ decision: 'ask', reason: `ccgate adapter error: ${e.message}` });
  } finally {
    if (tempTranscriptFile && fs.existsSync(tempTranscriptFile)) {
      try {
        fs.unlinkSync(tempTranscriptFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

function outputResult(result: PreToolUseOutput): void {
  process.stdout.write(JSON.stringify(result) + '\n');
}

// Only run main if executed directly via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
