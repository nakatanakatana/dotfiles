import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const statuslineScript = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'statusline.ts'
);

function runStatusline(inputJson: any): { stdout: string; stderr: string; status: number | null } {
  const inputStr = typeof inputJson === 'string' ? inputJson : JSON.stringify(inputJson);
  const result = spawnSync('node', [statuslineScript], {
    input: inputStr,
    encoding: 'utf-8',
  });
  return {
    stdout: result.stdout,
    stderr: result.stderr,
    status: result.status,
  };
}

test('statusline: moves quota information to line 2', () => {
  const input = {
    agent_state: 'idle',
    model: { display_name: 'Gemini 4 Argon' },
    quota: {
      'gemini-5h': {
        remaining_fraction: 0.8,
        reset_in_seconds: 3600,
      },
    },
    terminal_width: 100,
  };

  const { stdout, status } = runStatusline(input);
  assert.equal(status, 0);

  const lines = stdout.trimEnd().split('\n');
  assert.equal(lines.length, 2, 'Should output 2 lines when quota is present');

  // Line 1 should contain state and model, but NOT the 5h quota icon
  assert.ok(lines[0].includes('idle'));
  assert.ok(lines[0].includes('Gemini 4 Argon'));
  assert.ok(!lines[0].includes('󰅐'), 'Line 1 should not contain 5h quota icon');

  // Line 2 should contain 5h quota icon
  assert.ok(lines[1].includes('󰅐'), 'Line 2 should contain 5h quota icon');
});

test('statusline: renders Argon quota with atom icon in line 2', () => {
  const input = {
    agent_state: 'working',
    model: { display_name: 'Gemini 4 Argon' },
    quota: {
      argon: {
        remaining_fraction: 0.6,
        reset_in_seconds: 7200,
      },
    },
    terminal_width: 100,
  };

  const { stdout, status } = runStatusline(input);
  assert.equal(status, 0);

  const lines = stdout.trimEnd().split('\n');
  assert.equal(lines.length, 2, 'Should output 2 lines when Argon quota is present');

  // Line 2 should contain Argon atom icon 󰠱 and percentage (40% used)
  assert.ok(lines[1].includes('󰠱'), 'Line 2 should contain Argon atom icon 󰠱');
  assert.ok(lines[1].includes('40%'), 'Line 2 should display correct used percentage');
  assert.ok(!lines[0].includes('󰠱'), 'Line 1 should not contain Argon atom icon');
});

test('statusline: supports gemini-argon-wtu-weekly and fallback keys for Argon quota', () => {
  const inputWtu = {
    agent_state: 'idle',
    model: { display_name: 'Gemini 4 Argon' },
    quota: {
      'gemini-argon-wtu-weekly': {
        remaining_fraction: 0.64,
        reset_in_seconds: 600000,
      },
    },
    terminal_width: 100,
  };

  const resWtu = runStatusline(inputWtu);
  assert.equal(resWtu.status, 0);
  assert.ok(resWtu.stdout.includes('󰠱'), 'Should support gemini-argon-wtu-weekly key');
  assert.ok(resWtu.stdout.includes('36%'), 'Should show 36% used for 0.64 remaining');

  const inputWeekly = {
    agent_state: 'idle',
    model: { display_name: 'Gemini 4 Argon' },
    quota: {
      'argon-weekly': {
        remaining_fraction: 0.5,
        reset_in_seconds: 1800,
      },
    },
    terminal_width: 100,
  };

  const resWeekly = runStatusline(inputWeekly);
  assert.equal(resWeekly.status, 0);
  assert.ok(resWeekly.stdout.includes('󰠱'), 'Should support argon-weekly key');

  const inputGemini = {
    agent_state: 'idle',
    model: { display_name: 'Gemini 4 Argon' },
    quota: {
      'gemini-argon': {
        remaining_fraction: 0.9,
        reset_in_seconds: 1800,
      },
    },
    terminal_width: 100,
  };

  const resGemini = runStatusline(inputGemini);
  assert.equal(resGemini.status, 0);
  assert.ok(resGemini.stdout.includes('󰠱'), 'Should support gemini-argon key');
});

test('statusline: outputs 1 line when no quota or metrics exist', () => {
  const input = {
    agent_state: 'idle',
    model: { display_name: 'Gemini 3.8 Flash' },
    terminal_width: 80,
  };

  const { stdout, status } = runStatusline(input);
  assert.equal(status, 0);
  const lines = stdout.trimEnd().split('\n');
  assert.equal(lines.length, 1);
});

test('statusline: joins quota and task metrics on line 2', () => {
  const input = {
    agent_state: 'idle',
    model: { display_name: 'Gemini 4 Argon' },
    quota: {
      argon: {
        remaining_fraction: 0.7,
        reset_in_seconds: 1800,
      },
    },
    background_tasks: [
      { status: 'running' },
    ],
    terminal_width: 120,
  };

  const { stdout, status } = runStatusline(input);
  assert.equal(status, 0);
  const lines = stdout.trimEnd().split('\n');
  assert.equal(lines.length, 2);
  assert.ok(lines[1].includes('󰠱'));
  assert.ok(lines[1].includes('󰝖'));
});

