import test from 'node:test';
import assert from 'node:assert/strict';
import plugin, {
  ccgateServerPlugin,
  handlePermissionAsked,
} from './ccgate.ts';

test('plugin export has id, server, and setup properties for V1/V2 compatibility', () => {
  assert.equal(typeof plugin, 'object');
  assert.equal(plugin.id, 'ccgate');
  assert.equal(typeof plugin.server, 'function');
  assert.equal(typeof plugin.setup, 'function');
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
