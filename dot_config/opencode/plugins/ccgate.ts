import { spawnSync } from 'node:child_process';

export interface CcgateDecisionResult {
  decision?: 'allow' | 'deny' | 'fallthrough' | string;
  reason?: string;
  deny_message?: string;
  hookSpecificOutput?: {
    hookEventName?: string;
    decision?: {
      behavior?: 'allow' | 'deny' | 'fallthrough' | string;
      message?: string;
    };
  };
}

export function executeCcgate(payload: Record<string, any>): CcgateDecisionResult {
  const target = process.env.CCGATE_TARGET || 'claude';
  const child = spawnSync('ccgate', [target], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
    timeout: 25000,
  });

  if (child.error || child.status !== 0 || !child.stdout?.trim()) {
    return { decision: 'fallthrough' };
  }

  try {
    return JSON.parse(child.stdout.trim());
  } catch {
    return { decision: 'fallthrough' };
  }
}

export async function replyPermission(
  client: any,
  sessionID: string,
  permissionID: string,
  response: 'once' | 'always' | 'reject',
  message?: string
): Promise<void> {
  if (typeof client?.postSessionIdPermissionsPermissionId === 'function') {
    await client.postSessionIdPermissionsPermissionId({
      path: { id: sessionID, permissionID },
      body: { response, message },
    });
    return;
  }

  if (typeof client?.permission?.reply === 'function') {
    await client.permission.reply({
      requestID: permissionID,
      reply: response,
      message,
    });
    return;
  }
}

export async function handlePermissionAsked(
  event: any,
  client: any,
  cwd: string = process.cwd(),
  executor: (payload: any) => CcgateDecisionResult = executeCcgate
): Promise<void> {
  if (!event || event.type !== 'permission.asked') {
    return;
  }

  const info = event.properties;
  if (!info || info.permission !== 'bash') {
    return;
  }

  const command =
    Array.isArray(info.patterns) && info.patterns.length > 0
      ? info.patterns[0]
      : info.pattern || info.command;

  if (!command || typeof command !== 'string') {
    return;
  }

  const payload = {
    tool_name: 'Bash',
    tool_input: { command },
    cwd,
  };

  const result = executor(payload);
  const decision = result.hookSpecificOutput?.decision?.behavior ?? result.decision;
  const message =
    result.hookSpecificOutput?.decision?.message ?? result.deny_message ?? result.reason;

  if (decision === 'allow') {
    await replyPermission(client, info.sessionID, info.id, 'once');
  } else if (decision === 'deny') {
    await replyPermission(client, info.sessionID, info.id, 'reject', message);
  }
  // If 'fallthrough', do nothing so the default UI prompt is shown to the human
}

export const ccgateServerPlugin = async (input: any) => {
  return {
    config: async () => {},
    event: async ({ event }: { event: any }) => {
      await handlePermissionAsked(event, input.client, input.project?.path || input.directory);
    },
  };
};

// V1 (1.18.29+) calls server(). V2 calls setup().
// Exporting a plain record ensures readV1Plugin correctly detects it and avoids
// legacy export scanning that would mistakenly execute other exported helper functions.
const plugin = {
  id: 'ccgate',
  server: ccgateServerPlugin,
  setup() {},
};

export default plugin;
