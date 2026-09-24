import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAntigravityInput,
  mapCcgateDecision,
  convertAgyTranscriptToClaude,
  extractAllowedPrefixes,
  hasShellOperators,
  isCommandAllowed,
} from './ccgate-adapter.ts';

test('parseAntigravityInput extracts commandLine, cwd, and transcriptPath', () => {
  const rawInput = JSON.stringify({
    toolCall: {
      name: 'run_command',
      args: {
        CommandLine: 'git status',
      },
    },
    stepIdx: 10,
    conversationId: 'conv-123',
    workspacePaths: ['/workspace/repo'],
    transcriptPath: '/workspace/repo/transcript.jsonl',
  });

  const parsed = parseAntigravityInput(rawInput);
  assert.equal(parsed.toolName, 'run_command');
  assert.equal(parsed.commandLine, 'git status');
  assert.equal(parsed.cwd, '/workspace/repo');
  assert.equal(parsed.transcriptPath, '/workspace/repo/transcript.jsonl');
});

test('mapCcgateDecision maps allow, deny, and fallthrough correctly', () => {
  assert.deepEqual(
    mapCcgateDecision({ decision: 'allow', reason: 'Safe command' }),
    { decision: 'allow', reason: 'Safe command' }
  );

  assert.deepEqual(
    mapCcgateDecision({ decision: 'deny', deny_message: 'Blocked command' }),
    { decision: 'deny', reason: 'Blocked command' }
  );

  assert.deepEqual(
    mapCcgateDecision({ decision: 'fallthrough', reason: 'Unsure' }),
    { decision: 'ask', reason: 'Unsure' }
  );

  // Claude Code / Codex nested hookSpecificOutput format
  assert.deepEqual(
    mapCcgateDecision({
      hookSpecificOutput: {
        hookEventName: 'PermissionRequest',
        decision: { behavior: 'allow' },
      },
    }),
    { decision: 'allow', reason: undefined }
  );

  assert.deepEqual(
    mapCcgateDecision({
      hookSpecificOutput: {
        hookEventName: 'PermissionRequest',
        decision: { behavior: 'deny', message: 'Dangerous command' },
      },
    }),
    { decision: 'deny', reason: 'Dangerous command' }
  );

  assert.deepEqual(
    mapCcgateDecision({
      hookSpecificOutput: {
        hookEventName: 'PermissionRequest',
        decision: { behavior: 'fallthrough' },
      },
    }),
    { decision: 'ask', reason: 'ccgate fallthrough / uncertainty' }
  );

  assert.deepEqual(
    mapCcgateDecision(null),
    { decision: 'ask', reason: 'Invalid or missing ccgate output' }
  );
});

test('convertAgyTranscriptToClaude converts USER_INPUT and tool_calls', () => {
  const agyLines = [
    JSON.stringify({
      step_index: 1,
      type: 'USER_INPUT',
      source: 'USER_EXPLICIT',
      content: 'check git status please',
    }),
    JSON.stringify({
      step_index: 2,
      type: 'PLANNER_RESPONSE',
      source: 'MODEL',
      tool_calls: [{ name: 'run_command', args: { CommandLine: 'git status' } }],
    }),
  ].join('\n');

  const claudeLines = convertAgyTranscriptToClaude(agyLines);
  assert.ok(claudeLines.length > 0);
  
  const entries = claudeLines.map((line) => JSON.parse(line));
  assert.equal(entries[0].type, 'user');
  assert.equal(entries[0].message.role, 'user');
  assert.equal(entries[0].message.content, 'check git status please');
  assert.equal(entries[1].tool_name, 'run_command');
});

test('parseAntigravityInput handles malformed JSON gracefully', () => {
  const parsed = parseAntigravityInput('not json');
  assert.equal(parsed.toolName, '');
  assert.equal(parsed.commandLine, '');
});

test('convertAgyTranscriptToClaude handles empty or invalid lines gracefully', () => {
  const result = convertAgyTranscriptToClaude('\n  \n{"invalid":"json\n');
  assert.deepEqual(result, []);
});

test('extractAllowedPrefixes parses command() rules correctly', () => {
  const allowList = [
    'read_file(/tmp)',
    'command(git)',
    'command(npm test)',
    'command(kubectl get)',
    'unsandboxed(gh pr view)',
  ];
  const prefixes = extractAllowedPrefixes(allowList);
  assert.deepEqual(prefixes, ['git', 'npm test', 'kubectl get']);
});

test('hasShellOperators detects dangerous operators', () => {
  assert.equal(hasShellOperators('git status'), false);
  assert.equal(hasShellOperators('kubectl get pods -n default'), false);
  assert.equal(hasShellOperators('git status | grep foo'), true);
  assert.equal(hasShellOperators('npm test && rm -rf /'), true);
  assert.equal(hasShellOperators('npm test || true'), true);
  assert.equal(hasShellOperators('cat foo; ls'), true);
  assert.equal(hasShellOperators('echo "hello" > out.txt'), true);
  assert.equal(hasShellOperators('cat < file.txt'), true);
  assert.equal(hasShellOperators('echo $(whoami)'), true);
  assert.equal(hasShellOperators('echo `whoami`'), true);
});

test('isCommandAllowed correctly matches commands with prefix boundary', () => {
  const allowedPrefixes = ['git', 'npm test', 'kubectl get'];

  // Exact matches and prefixes with arguments
  assert.equal(isCommandAllowed('git', allowedPrefixes), true);
  assert.equal(isCommandAllowed('git status', allowedPrefixes), true);
  assert.equal(isCommandAllowed('npm test --coverage', allowedPrefixes), true);
  assert.equal(isCommandAllowed('kubectl get pods', allowedPrefixes), true);

  // Different command sharing prefix name (boundary check)
  assert.equal(isCommandAllowed('git-lfs push', allowedPrefixes), false);
  assert.equal(isCommandAllowed('npm run test', allowedPrefixes), false);
  assert.equal(isCommandAllowed('kubectl delete pod', allowedPrefixes), false);

  // Commands with shell operators must not be allowed
  assert.equal(isCommandAllowed('git status | cat', allowedPrefixes), false);
  assert.equal(isCommandAllowed('kubectl get pods; echo 1', allowedPrefixes), false);
});

