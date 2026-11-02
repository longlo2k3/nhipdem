const { test } = require('node:test');
const assert = require('node:assert/strict');
const { plans, localDate, dateValid, defaultPlan, makeSession, progress, validate } = require('../workout-plan.js');

test('preserves the three screenshot schedules and distinct Friday targets', () => {
  assert.deepEqual(plans.map(p => p.exercises.map(e => [e.sets, e.min, e.max, e.unit])), [
    [[3,8,12,'reps'],[3,6,10,'reps'],[2,8,12,'reps'],[3,8,12,'leg'],[3,10,15,'leg'],[2,20,40,'seconds']],
    [[4,4,8,'reps'],[3,5,8,'reps'],[3,10,12,'leg'],[3,12,20,'leg'],[3,8,12,'reps'],[3,8,15,'reps']],
    [[3,4,8,'reps'],[3,8,12,'reps'],[2,6,10,'reps'],[3,10,12,'leg'],[3,10,15,'leg'],[2,30,60,'seconds']],
  ]);
});
test('selects the local calendar day without a UTC date shift', () => {
  assert.equal(localDate(new Date(2026, 10, 2, 0, 5)), '2026-11-02');
  assert.equal(defaultPlan('2026-11-02'), 'push');
  assert.equal(defaultPlan('2026-11-04'), 'pull');
  assert.equal(defaultPlan('2026-11-06'), 'full');
  assert.equal(dateValid('2026-02-30'), false);
  assert.equal(dateValid('2028-02-29'), true);
});
test('tracks partial sets separately from completed exercises and isolates days', () => {
  const monday = makeSession('2026-11-02', plans[0]);
  const friday = makeSession('2026-11-06', plans[2]);
  monday.exercises.pike[0] = { value: '7', done: true };
  assert.deepEqual(progress(monday, plans[0]), { exercises: 0, sets: 1, total: 16 });
  monday.exercises.pike.forEach(s => { s.done = true; });
  assert.equal(progress(monday, plans[0]).exercises, 1);
  assert.equal(progress(friday, plans[2]).sets, 0);
  assert.equal(progress(null, plans[1]).total, 19);
});
test('round trips notes and results through backup validation', () => {
  const s = makeSession('2026-11-02', plans[0]);
  s.note = 'Hôm nay tập tốt <script>không thực thi</script>';
  s.exercises.decline[0] = { value: '10', done: true };
  const data = { version: 1, sessions: { '2026-11-02_push': s } };
  assert.deepEqual(validate(JSON.parse(JSON.stringify(data))), data);
});
test('rejects invalid backups before replacing data', () => {
  for (const bad of [null, {}, { version: 2, sessions: {} }, { version: 1, sessions: [] }]) assert.throws(() => validate(bad));
  const s = makeSession('2026-11-02', plans[0]);
  const data = { version: 1, sessions: { '2026-11-02_push': s } };
  s.exercises.decline[0].value = '-1';
  assert.throws(() => validate(data));
  s.exercises.decline[0].value = '';
  s.exercises.decline.pop();
  assert.throws(() => validate(data));
  assert.throws(() => validate({ version: 1, sessions: { wrong: makeSession('2026-11-02', plans[0]) } }));
});
