import test from 'node:test';
import assert from 'node:assert/strict';
import plugin, {
  ccgateServerPlugin,
  ccgateSetup,
  handlePermissionAsked,
} from '../plugins/ccgate.ts';

test('plugin export has id, server, and setup properties for V1/V2 compatibility', () => {
  assert.equal(typeof plugin, 'object');
  assert.equal(plugin.id, 'ccgate');
  assert.equal(typeof plugin.server, 'function');
  assert.equal(plugin.setup, ccgateSetup);
  assert.equal(typeof ccgateServerPlugin, 'function');
});

test('handlePermissionAsked approves when ccgate returns allow', async () => {
  let repliedWith: any = null;
  const mockClient = {
    postSessionIdPermissionsPermissionId: async (args: any) => {
      repliedWith = args;
    },
  };

  const mockExecuteCcgate = (_payload: any) => {
    return { decision: 'allow', reason: 'Safe command' };
  };

  const event = {
    type: 'permission.asked',
    properties: {
      id: 'perm-123',
      sessionID: 'sess-456',
      permission: 'bash',
      patterns: ['kubectl get pods'],
    },
  };

  await handlePermissionAsked(event, mockClient, '/repo', mockExecuteCcgate);

  assert.deepEqual(repliedWith, {
    path: { id: 'sess-456', permissionID: 'perm-123' },
    body: { response: 'once', message: undefined },
  });
});

test('handlePermissionAsked rejects when ccgate returns deny', async () => {
  let repliedWith: any = null;
  const mockClient = {
    postSessionIdPermissionsPermissionId: async (args: any) => {
      repliedWith = args;
    },
  };

  const mockExecuteCcgate = (_payload: any) => {
    return { decision: 'deny', deny_message: 'Dangerous command' };
  };

  const event = {
    type: 'permission.asked',
    properties: {
      id: 'perm-123',
      sessionID: 'sess-456',
      permission: 'bash',
      patterns: ['kubectl delete pod my-pod'],
    },
  };

  await handlePermissionAsked(event, mockClient, '/repo', mockExecuteCcgate);

  assert.deepEqual(repliedWith, {
    path: { id: 'sess-456', permissionID: 'perm-123' },
    body: { response: 'reject', message: 'Dangerous command' },
  });
});

test('handlePermissionAsked does nothing (falls through) when ccgate returns fallthrough', async () => {
  let called = false;
  const mockClient = {
    postSessionIdPermissionsPermissionId: async () => {
      called = true;
    },
  };

  const mockExecuteCcgate = (_payload: any) => {
    return { decision: 'fallthrough' };
  };

  const event = {
    type: 'permission.asked',
    properties: {
      id: 'perm-123',
      sessionID: 'sess-456',
      permission: 'bash',
      patterns: ['kubectl describe pod my-pod'],
    },
  };

  await handlePermissionAsked(event, mockClient, '/repo', mockExecuteCcgate);

  assert.equal(called, false);
});

test('handlePermissionAsked ignores non-bash permissions', async () => {
  let called = false;
  const mockClient = {
    postSessionIdPermissionsPermissionId: async () => {
      called = true;
    },
  };

  const mockExecuteCcgate = () => {
    called = true;
    return { decision: 'allow' };
  };

  const event = {
    type: 'permission.asked',
    properties: {
      id: 'perm-123',
      sessionID: 'sess-456',
      permission: 'read',
      patterns: ['/etc/passwd'],
    },
  };

  await handlePermissionAsked(event, mockClient, '/repo', mockExecuteCcgate);

  assert.equal(called, false);
});

type PermissionHook = (event: any) => Promise<void> | void;

async function createSetupHarness(
  result: any,
  ctxDirectory = '/repo'
) {
  let hookName: string | undefined;
  let hook: PermissionHook | undefined;
  const payloads: any[] = [];
  let disposed = false;

  const ctx = {
    location: { directory: ctxDirectory },
    permission: {
      hook: async (name: string, callback: PermissionHook) => {
        hookName = name;
        hook = callback;
        return {
          dispose: async () => {
            disposed = true;
          },
        };
      },
    },
  };

  const cleanup = await ccgateSetup(ctx, (payload: any) => {
    payloads.push(payload);
    return result;
  });

  return {
    hookName: () => hookName,
    hook: () => hook,
    payloads,
    cleanup,
    disposed: () => disposed,
  };
}

test('ccgateSetup registers a permission evaluate hook and returns a cleanup function', async () => {
  const harness = await createSetupHarness({ decision: 'allow' });

  assert.equal(harness.hookName(), 'evaluate');
  assert.equal(typeof harness.hook(), 'function');

  await harness.cleanup();
  assert.equal(harness.disposed(), true);
});

test('ccgateSetup approves bash when ccgate returns allow', async () => {
  const harness = await createSetupHarness({ decision: 'allow' });
  const event: any = {
    action: 'bash',
    resources: ['ls -la'],
    effect: 'ask',
  };

  const hook = harness.hook();
  assert.ok(hook);
  await hook(event);

  assert.equal(event.effect, 'allow');
  assert.deepEqual(harness.payloads[0], {
    tool_name: 'Bash',
    tool_input: { command: 'ls -la' },
    cwd: '/repo',
  });
});

test('ccgateSetup denies bash with a message when ccgate returns deny', async () => {
  const harness = await createSetupHarness({
    hookSpecificOutput: {
      decision: { behavior: 'deny', message: 'Dangerous command' },
    },
  });
  const event: any = {
    action: 'bash',
    resources: ['kubectl delete pod my-pod'],
    effect: 'ask',
  };

  const hook = harness.hook();
  assert.ok(hook);
  await hook(event);

  assert.equal(event.effect, 'deny');
  assert.equal(event.message, 'Dangerous command');
});

test('ccgateSetup leaves the effect unchanged when ccgate falls through', async () => {
  const harness = await createSetupHarness({ decision: 'fallthrough' });
  const event: any = {
    action: 'bash',
    resources: ['kubectl describe pod my-pod'],
    effect: 'ask',
  };

  const hook = harness.hook();
  assert.ok(hook);
  await hook(event);

  assert.equal(event.effect, 'ask');
  assert.equal(event.message, undefined);
});

test('ccgateSetup ignores non-bash permissions', async () => {
  const harness = await createSetupHarness({ decision: 'allow' });
  const event: any = {
    action: 'read',
    resources: ['/etc/passwd'],
    effect: 'ask',
  };

  const hook = harness.hook();
  assert.ok(hook);
  await hook(event);

  assert.equal(event.effect, 'ask');
  assert.equal(harness.payloads.length, 0);
});

test('ccgateSetup ignores bash without a command resource', async () => {
  const harness = await createSetupHarness({ decision: 'allow' });
  const event: any = {
    action: 'bash',
    resources: [],
    effect: 'ask',
  };

  const hook = harness.hook();
  assert.ok(hook);
  await hook(event);

  assert.equal(event.effect, 'ask');
  assert.equal(harness.payloads.length, 0);
});
