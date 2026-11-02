const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createWriter, removeSession } = require('../mobile/src/persistence.ts');
const { plans, makeSession, validate } = require('../workout-plan.js');

test('native and browser use the identical prescribed schedule and backup format', () => {
  const root = path.resolve(__dirname, '..');
  assert.equal(fs.readFileSync(path.join(root, 'mobile/src/training.js'), 'utf8'), fs.readFileSync(path.join(root, 'workout-plan.js'), 'utf8'));
});
test('serializes rapid edits and captures the state at enqueue time', async () => {
  const values = [];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const writer = createWriter(async value => { if (!values.length) await gate; values.push(JSON.parse(value)); });
  const data = { version: 1, sessions: {} };
  const first = writer(data);
  data.sessions.next = { note: 'newer snapshot' };
  const second = writer(data);
  await Promise.resolve();
  assert.equal(values.length, 0);
  release();
  await Promise.all([first, second]);
  assert.deepEqual(values[0].sessions, {});
  assert.equal(values[1].sessions.next.note, 'newer snapshot');
});
test('a failed save reports failure and does not block later retries', async () => {
  let calls = 0;
  const saved = [];
  const writer = createWriter(async value => { if (++calls === 1) throw new Error('disk full'); saved.push(value); });
  const data = { version: 1, sessions: {} };
  await assert.rejects(writer(data), /disk full/);
  await writer(data);
  assert.equal(saved.length, 1);
});

test('deleting one history entry preserves other sessions and the original snapshot', () => {
  const first = makeSession('2026-11-02', plans[0]);
  first.note = 'Buổi cần xóa';
  const other = makeSession('2026-11-02', plans[1]);
  other.note = 'Giữ lại';
  other.exercises[plans[1].exercises[0].id][0] = { done: true, value: '8' };
  const data = { version: 1, sessions: { '2026-11-02_push': first, '2026-11-02_pull': other } };
  const next = removeSession(data, '2026-11-02_push');
  assert.deepEqual(validate(next).sessions, { '2026-11-02_pull': other });
  assert.deepEqual(Object.keys(data.sessions), ['2026-11-02_push', '2026-11-02_pull']);
  assert.deepEqual(removeSession(next, 'missing'), next);
  assert.deepEqual(validate(removeSession(next, '2026-11-02_pull')).sessions, {});
});

test('a queued edit cannot restore a deleted history entry in storage', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let stored;
  let calls = 0;
  const writer = createWriter(async value => {
    if (++calls === 1) await gate;
    stored = value;
  });
  const data = { version: 1, sessions: { '2026-11-02_push': makeSession('2026-11-02', plans[0]) } };
  const edit = writer(data);
  const deletion = writer(removeSession(data, '2026-11-02_push'));
  release();
  await Promise.all([edit, deletion]);
  assert.deepEqual(validate(JSON.parse(stored)).sessions, {});
});
