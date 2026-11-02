(function (root) {
  'use strict';
  const exercise = (id, name, muscles, sets, min, max, unit = 'reps') => ({ id, name, muscles, sets, min, max, unit });
  const plans = [
    { id: 'push', day: 'Thứ 2', title: 'Push + Legs', focus: 'Ngực · Vai · Tay sau · Đùi', tag: 'ĐẨY & CHÂN', exercises: [
      exercise('decline', 'Decline Push-up', 'Ngực trên, vai trước', 3, 8, 12),
      exercise('pike', 'Pike Push-up', 'Vai, tay sau', 3, 6, 10),
      exercise('diamond', 'Diamond Push-up', 'Tay sau, ngực', 2, 8, 12),
      exercise('bulgarian', 'Bulgarian Split Squat', 'Đùi trước, mông', 3, 8, 12, 'leg'),
      exercise('bridge', 'Single-leg Glute Bridge', 'Mông, đùi sau', 3, 10, 15, 'leg'),
      exercise('hollow', 'Hollow Hold', 'Bụng', 2, 20, 40, 'seconds'),
    ] },
    { id: 'pull', day: 'Thứ 4', title: 'Pull + Legs', focus: 'Lưng · Tay trước · Chân', tag: 'KÉO & CHÂN', exercises: [
      exercise('pullup', 'Pull-up', 'Xô, tay trước', 4, 4, 8),
      exercise('chinup', 'Chin-up', 'Xô, tay trước', 3, 5, 8),
      exercise('lunge', 'Reverse Lunge', 'Đùi, mông', 3, 10, 12, 'leg'),
      exercise('calf', 'Single-leg Calf Raise', 'Bắp chân', 3, 12, 20, 'leg'),
      exercise('curl', 'Sliding Hamstring Curl', 'Đùi sau', 3, 8, 12),
      exercise('kneeraise', 'Hanging Knee Raise', 'Bụng', 3, 8, 15),
    ] },
    { id: 'full', day: 'Thứ 6', title: 'Full Body', focus: 'Ngực · Lưng · Vai · Chân · Core', tag: 'TOÀN THÂN', exercises: [
      exercise('pullup', 'Pull-up', 'Lưng, tay trước', 3, 4, 8),
      exercise('pushup', 'Push-up (tempo chậm)', 'Ngực, tay sau', 3, 8, 12),
      exercise('pike', 'Pike Push-up', 'Vai', 2, 6, 10),
      exercise('bulgarian', 'Bulgarian Split Squat', 'Đùi, mông', 3, 10, 12, 'leg'),
      exercise('bridge', 'Single-leg Glute Bridge', 'Mông, đùi sau', 3, 10, 15, 'leg'),
      exercise('plank', 'Plank', 'Core', 2, 30, 60, 'seconds'),
    ] },
  ];
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const dateValid = s => {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(`${s}T12:00:00`);
    return !Number.isNaN(d.getTime()) && localDate(d) === s;
  };
  const defaultPlan = date => ({ 1: 'push', 3: 'pull', 5: 'full' }[new Date(`${date}T12:00:00`).getDay()] || 'push');
  const makeSession = (date, plan) => ({ date, plan: plan.id, note: '', exercises: Object.fromEntries(plan.exercises.map(e => [e.id, Array.from({ length: e.sets }, () => ({ done: false, value: '' }))])) });
  const progress = (session, plan) => {
    const rows = plan.exercises.map(e => session?.exercises[e.id] || []);
    return { exercises: rows.filter(row => row.length && row.every(s => s.done)).length, sets: rows.flat().filter(s => s.done).length, total: plan.exercises.reduce((sum, e) => sum + e.sets, 0) };
  };
  const validate = data => {
    if (!data || data.version !== 1 || !data.sessions || typeof data.sessions !== 'object' || Array.isArray(data.sessions)) throw Error('Bản sao lưu không đúng định dạng.');
    const sessions = {};
    for (const [key, s] of Object.entries(data.sessions)) {
      const plan = plans.find(p => p.id === s?.plan);
      if (!plan || !dateValid(s.date) || key !== `${s.date}_${s.plan}` || typeof s.note !== 'string' || s.note.length > 5000 || !s.exercises) throw Error('Dữ liệu buổi tập không hợp lệ.');
      const clean = makeSession(s.date, plan);
      clean.note = s.note;
      for (const e of plan.exercises) {
        const row = s.exercises[e.id];
        if (!Array.isArray(row) || row.length !== e.sets) throw Error('Số hiệp không khớp lịch tập.');
        clean.exercises[e.id] = row.map(set => {
          if (!set || typeof set.done !== 'boolean' || typeof set.value !== 'string' || (set.value !== '' && (!/^\d{1,4}$/.test(set.value) || Number(set.value) < 0))) throw Error('Kết quả hiệp không hợp lệ.');
          return { done: set.done, value: set.value };
        });
      }
      sessions[key] = clean;
    }
    return { version: 1, sessions };
  };
  const api = { plans, localDate, dateValid, defaultPlan, makeSession, progress, validate };
  root.Training = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
