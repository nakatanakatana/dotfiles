#!/usr/bin/env node
import { spawn } from 'node:child_process';
import * as path from 'node:path';

const APP_NAME = 'Antigravity CLI';
const MAX_BODY_DETAIL_LENGTH = 100;

export type NotificationUrgency = 'low' | 'normal' | 'critical';

export interface NotificationSpec {
  urgency: NotificationUrgency;
  summary: string;
  body: string;
}

export interface HookPayload {
  hookEventName?: string;
  terminationReason?: string;
  error?: string;
  cwd?: string;
  workspacePaths?: string[];
  toolCall?: {
    name?: string;
    args?: {
      questions?: Array<{ question?: string }>;
      CommandLine?: string;
      [key: string]: unknown;
    };
  };
}

export interface HookHandleResult {
  notification: NotificationSpec | null;
  output: Record<string, unknown>;
}

function truncate(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return normalized.slice(0, maxLength - 1) + '…';
}

function formatSummary(cwd?: string): string {
  const dir = cwd ? path.basename(cwd.replace(/\/+$/, '')) : '';
  return dir ? `${APP_NAME} (${dir})` : APP_NAME;
}

export function buildStopNotification(
  terminationReason?: string,
  error?: string,
  cwd?: string
): NotificationSpec | null {
  if (terminationReason === 'USER_CANCELED') {
    return null;
  }

  const summary = formatSummary(cwd);

  if (terminationReason === 'ERROR') {
    const detail = error ? truncate(error, MAX_BODY_DETAIL_LENGTH) : '';
    return {
      urgency: 'critical',
      summary,
      body: detail ? `エラーで終了しました: ${detail}` : 'エラーで終了しました',
    };
  }

  return {
    urgency: 'normal',
    summary,
    body: 'タスクが完了しました',
  };
}

export function buildAskQuestionNotification(
  firstQuestion?: string,
  cwd?: string
): NotificationSpec {
  const summary = formatSummary(cwd);
  const detail = firstQuestion ? truncate(firstQuestion, MAX_BODY_DETAIL_LENGTH) : '';

  return {
    urgency: 'normal',
    summary,
    body: detail ? `確認が必要です: ${detail}` : '確認・質問があります',
  };
}

export function buildCommandApprovalNotification(
  commandLine: string,
  cwd?: string
): NotificationSpec {
  const summary = formatSummary(cwd);
  const detail = commandLine ? truncate(commandLine, MAX_BODY_DETAIL_LENGTH) : '';

  return {
    urgency: 'normal',
    summary,
    body: detail ? `コマンド実行の確認が必要です: ${detail}` : 'コマンド実行の確認が必要です',
  };
}

export function handleHookPayload(inputStr: string): HookHandleResult {
  let payload: HookPayload;
  try {
    payload = JSON.parse(inputStr);
  } catch {
    return { notification: null, output: {} };
  }

  const cwd = payload.cwd || payload.workspacePaths?.[0];

  if (payload.hookEventName === 'Stop') {
    return {
      notification: buildStopNotification(payload.terminationReason, payload.error, cwd),
      output: { decision: 'stop' },
    };
  }

  if (payload.hookEventName === 'PreToolUse') {
    if (payload.toolCall?.name === 'ask_question') {
      const firstQuestion = payload.toolCall.args?.questions?.[0]?.question;
      return {
        notification: buildAskQuestionNotification(firstQuestion, cwd),
        output: { decision: 'allow' },
      };
    }
    return { notification: null, output: { decision: 'allow' } };
  }

  return { notification: null, output: {} };
}

export function buildNotifySendArgs(spec: NotificationSpec): string[] {
  return ['-a', APP_NAME, '-u', spec.urgency, spec.summary, spec.body];
}

export function sendNotification(spec: NotificationSpec): void {
  try {
    const child = spawn('notify-send', buildNotifySendArgs(spec), {
      detached: true,
      stdio: 'ignore',
    });
    child.on('error', () => {
      // Ignore errors when notify-send is unavailable
    });
    child.unref();
  } catch {
    // Ignore spawn errors so hooks never block the agent loop
  }
}

async function main(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const inputStr = Buffer.concat(chunks).toString('utf-8').trim();
  const { notification, output } = handleHookPayload(inputStr);

  if (notification) {
    sendNotification(notification);
  }

  process.stdout.write(JSON.stringify(output) + '\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
