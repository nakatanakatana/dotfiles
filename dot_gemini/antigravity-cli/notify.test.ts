import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildNotifySendArgs,
  buildStopNotification,
  buildAskQuestionNotification,
  buildCommandApprovalNotification,
  handleHookPayload,
} from './notify.ts';

test('handleHookPayload builds completion notification on normal Stop', () => {
  const result = handleHookPayload(
    JSON.stringify({
      hookEventName: 'Stop',
      terminationReason: 'NO_TOOL_CALL',
      cwd: '/home/tanaka/repos/dotfiles',
    })
  );

  assert.deepEqual(result.output, { decision: 'stop' });
  assert.deepEqual(result.notification, {
    urgency: 'normal',
    summary: 'Antigravity CLI (dotfiles)',
    body: 'タスクが完了しました',
  });
});

test('handleHookPayload suppresses notification on USER_CANCELED Stop', () => {
  const result = handleHookPayload(
    JSON.stringify({
      hookEventName: 'Stop',
      terminationReason: 'USER_CANCELED',
      cwd: '/home/tanaka/repos/dotfiles',
    })
  );

  assert.deepEqual(result.output, { decision: 'stop' });
  assert.equal(result.notification, null);
});

test('handleHookPayload builds critical notification on ERROR Stop', () => {
  const result = handleHookPayload(
    JSON.stringify({
      hookEventName: 'Stop',
      terminationReason: 'ERROR',
      error: 'API timeout',
      cwd: '/home/tanaka/repos/dotfiles',
    })
  );

  assert.deepEqual(result.output, { decision: 'stop' });
  assert.deepEqual(result.notification, {
    urgency: 'critical',
    summary: 'Antigravity CLI (dotfiles)',
    body: 'エラーで終了しました: API timeout',
  });
});

test('handleHookPayload falls back to workspacePaths when cwd is missing', () => {
  const result = handleHookPayload(
    JSON.stringify({
      hookEventName: 'Stop',
      terminationReason: 'NO_TOOL_CALL',
      workspacePaths: ['/home/tanaka/repos/my-app'],
    })
  );

  assert.equal(result.notification?.summary, 'Antigravity CLI (my-app)');
});

test('handleHookPayload builds notification for ask_question PreToolUse', () => {
  const result = handleHookPayload(
    JSON.stringify({
      hookEventName: 'PreToolUse',
      cwd: '/home/tanaka/repos/dotfiles',
      toolCall: {
        name: 'ask_question',
        args: {
          questions: [{ question: 'どの方式にしますか？' }],
        },
      },
    })
  );

  assert.deepEqual(result.output, { decision: 'allow' });
  assert.deepEqual(result.notification, {
    urgency: 'normal',
    summary: 'Antigravity CLI (dotfiles)',
    body: '確認が必要です: どの方式にしますか？',
  });
});

test('handleHookPayload falls back to generic message when ask_question has no question text', () => {
  const result = handleHookPayload(
    JSON.stringify({
      hookEventName: 'PreToolUse',
      toolCall: {
        name: 'ask_question',
        args: {},
      },
    })
  );

  assert.deepEqual(result.output, { decision: 'allow' });
  assert.deepEqual(result.notification, {
    urgency: 'normal',
    summary: 'Antigravity CLI',
    body: '確認・質問があります',
  });
});

test('handleHookPayload ignores other PreToolUse tools without notifying', () => {
  const result = handleHookPayload(
    JSON.stringify({
      hookEventName: 'PreToolUse',
      toolCall: {
        name: 'read_file',
        args: { Path: '/tmp/foo' },
      },
    })
  );

  assert.deepEqual(result.output, { decision: 'allow' });
  assert.equal(result.notification, null);
});

test('handleHookPayload handles malformed JSON gracefully', () => {
  const result = handleHookPayload('not json');

  assert.deepEqual(result.output, {});
  assert.equal(result.notification, null);
});

test('buildCommandApprovalNotification truncates long command lines', () => {
  const longCmd = 'git push origin ' + 'a'.repeat(200);
  const notification = buildCommandApprovalNotification(longCmd, '/home/tanaka/repos/dotfiles');

  assert.equal(notification.urgency, 'normal');
  assert.equal(notification.summary, 'Antigravity CLI (dotfiles)');
  assert.ok(notification.body.startsWith('コマンド実行の確認が必要です: git push origin '));
  assert.ok(notification.body.endsWith('…'));
  assert.ok(notification.body.length <= 140);
});

test('buildNotifySendArgs formats arguments for notify-send', () => {
  const args = buildNotifySendArgs({
    urgency: 'critical',
    summary: 'Antigravity CLI (dotfiles)',
    body: 'エラーで終了しました',
  });

  assert.deepEqual(args, [
    '-a',
    'Antigravity CLI',
    '-u',
    'critical',
    'Antigravity CLI (dotfiles)',
    'エラーで終了しました',
  ]);
});

test('buildStopNotification and buildAskQuestionNotification handle empty cwd', () => {
  assert.equal(buildStopNotification('NO_TOOL_CALL')?.summary, 'Antigravity CLI');
  assert.equal(buildAskQuestionNotification().summary, 'Antigravity CLI');
});
