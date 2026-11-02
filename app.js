/* global Training */
(() => {
  'use strict';
  const { plans, localDate, dateValid, defaultPlan, makeSession, progress, validate } = Training;
  const $ = selector => document.querySelector(selector);
  const storageKey = 'nhip-tap.v1';
  let data = { version: 1, sessions: {} };
  let date = localDate();
  let planId = defaultPlan(date);
  let currentView = 'workout';
  let storageBlocked = false;
  let recoveryLocked = false;
  let toastTimeout;
  const esc = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const plan = () => plans.find(p => p.id === planId);
  const key = () => `${date}_${planId}`;
  const current = () => data.sessions[key()] || makeSession(date, plan());
  function warn(message) {
    $('#storage-warning').textContent = message;
    $('#storage-warning').hidden = false;
  }
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) data = validate(JSON.parse(saved));
  } catch (error) {
    storageBlocked = true;
    recoveryLocked = true;
    warn('Không đọc được dữ liệu đã lưu. Ứng dụng sẽ giữ nguyên bản cũ và chỉ ghi tạm trong phiên này. Hãy xuất bản sao lưu trước khi đóng trang.');
  }
  function toast(message) {
    clearTimeout(toastTimeout);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimeout = setTimeout(() => { $('#toast').hidden = true; }, 4200);
  }
  function persist() {
    if (recoveryLocked) {
      $('#save-status').textContent = 'Đang lưu tạm — hãy xuất bản sao lưu';
      $('#footer-status').textContent = 'Chưa lưu trên thiết bị · Cần xuất bản sao lưu';
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      storageBlocked = false;
      $('#storage-warning').hidden = true;
      $('#save-status').textContent = 'Đã lưu trên trình duyệt này';
      $('#footer-status').textContent = 'Lưu tự động · Không cần tài khoản';
    } catch (error) {
      storageBlocked = true;
      warn('Trình duyệt không lưu được dữ liệu. Kết quả vẫn còn trong phiên này; hãy xuất bản sao lưu trước khi đóng trang.');
      $('#save-status').textContent = 'Chưa lưu trên thiết bị — hãy xuất bản sao lưu';
      $('#footer-status').textContent = 'Chưa lưu trên thiết bị · Cần xuất bản sao lưu';
    }
  }
  function mutate(callback) {
    if (!data.sessions[key()]) data.sessions[key()] = makeSession(date, plan());
    callback(data.sessions[key()]);
    persist();
  }
  function target(e) {
    return `${e.sets} × ${e.min}–${e.max}${e.unit === 'leg' ? '<small>/chân</small>' : e.unit === 'seconds' ? ' <small>giây</small>' : ''}`;
  }
  function renderProgress() {
    const stats = progress(current(), plan());
    $('#completed-count').textContent = `${stats.exercises}/6`;
    $('#set-count').textContent = `${stats.sets} / ${stats.total}`;
    $('#workout-progress').style.width = `${stats.sets / stats.total * 100}%`;
  }
  function renderWorkout() {
    const p = plan();
    const s = current();
    $('#session-date').value = date;
    $('#plan-tabs').innerHTML = plans.map(p => `<button id="tab-${p.id}" role="tab" aria-selected="${p.id === planId}" aria-controls="exercise-list" class="tab ${p.id === planId ? 'active' : ''}" data-plan="${p.id}">${p.day}</button>`).join('');
    $('#plan-tag').textContent = p.tag;
    $('#workout-title').textContent = p.title;
    $('#plan-focus').textContent = p.focus;
    $('#exercise-list').setAttribute('role', 'tabpanel');
    $('#exercise-list').setAttribute('aria-labelledby', `tab-${p.id}`);
    $('#exercise-list').innerHTML = p.exercises.map((e, index) => {
      const sets = s.exercises[e.id];
      const done = sets.every(set => set.done);
      return `<article class="exercise ${done ? 'done' : ''}" data-exercise="${e.id}"><div class="exercise-top"><button class="exercise-check" aria-label="Đánh dấu toàn bộ bài ${esc(e.name)}" aria-pressed="${done}" data-all="${e.id}">${done ? '✓' : ''}</button><div class="exercise-title"><h3 class="exercise-name">${esc(e.name)}</h3><div class="exercise-muscles">${esc(e.muscles)}</div></div><span class="exercise-target">${target(e)}</span></div><div class="sets">${sets.map((set, i) => `<div class="set ${set.done ? 'done' : ''}"><label for="result-${index}-${i}">H${i + 1}</label><input id="result-${index}-${i}" aria-label="${esc(e.name)}, hiệp ${i + 1}, ${e.unit === 'seconds' ? 'số giây' : e.unit === 'leg' ? 'số lần mỗi chân' : 'số lần'}" type="number" min="0" max="9999" step="1" inputmode="numeric" placeholder="—" value="${set.value}" data-value="${e.id}" data-index="${i}"><button data-set="${e.id}" data-index="${i}" aria-label="Hoàn thành ${esc(e.name)}, hiệp ${i + 1}" aria-pressed="${set.done}">${set.done ? '✓' : '○'}</button></div>`).join('')}</div>${e.unit !== 'reps' ? `<div class="set-unit">${e.unit === 'seconds' ? 'Ghi thời gian thực tế bằng giây' : 'Ghi số lần mỗi chân · hoàn thành cả hai bên'}</div>` : ''}</article>`;
    }).join('');
    $('#session-note').value = s.note;
    $('#save-status').textContent = storageBlocked ? 'Đang lưu tạm — hãy xuất bản sao lưu' : 'Tự động lưu trên trình duyệt này';
    renderProgress();
  }
  function updateChecks(id) {
    const row = $(`[data-exercise="${id}"]`);
    const sets = current().exercises[id];
    const done = sets.every(s => s.done);
    row.classList.toggle('done', done);
    const all = row.querySelector('[data-all]');
    all.setAttribute('aria-pressed', String(done));
    all.textContent = done ? '✓' : '';
    row.querySelectorAll('[data-set]').forEach((button, i) => {
      button.setAttribute('aria-pressed', String(sets[i].done));
      button.textContent = sets[i].done ? '✓' : '○';
      button.closest('.set').classList.toggle('done', sets[i].done);
    });
    renderProgress();
    if (progress(current(), plan()).exercises === 6) toast('Bạn đã hoàn thành buổi tập. Kết quả đã được ghi lại!');
  }
  $('#plan-tabs').addEventListener('click', event => {
    const button = event.target.closest('[data-plan]');
    if (!button) return;
    planId = button.dataset.plan;
    renderWorkout();
    $(`#tab-${planId}`).focus();
  });
  $('#plan-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = plans.findIndex(p => p.id === planId);
    planId = plans[event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3].id;
    renderWorkout();
    $(`#tab-${planId}`).focus();
  });
  $('#session-date').addEventListener('change', event => {
    if (!dateValid(event.target.value)) { event.target.value = date; return; }
    date = event.target.value;
    planId = defaultPlan(date);
    renderWorkout();
  });
  $('#exercise-list').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.all) {
      const id = button.dataset.all;
      mutate(s => { const done = !s.exercises[id].every(set => set.done); s.exercises[id].forEach(set => { set.done = done; }); });
      updateChecks(id);
    } else if (button.dataset.set) {
      const id = button.dataset.set;
      mutate(s => { const set = s.exercises[id][Number(button.dataset.index)]; set.done = !set.done; });
      updateChecks(id);
    }
  });
  $('#exercise-list').addEventListener('input', event => {
    const input = event.target;
    if (!input.matches('[data-value]')) return;
    const value = input.value;
    if (value !== '' && (!/^\d{1,4}$/.test(value) || !input.validity.valid)) {
      input.setCustomValidity('Nhập số nguyên từ 0 đến 9999.');
      input.reportValidity();
      input.setCustomValidity('');
      return;
    }
    input.setCustomValidity('');
    mutate(s => { s.exercises[input.dataset.value][Number(input.dataset.index)].value = value; });
  });
  $('#session-note').addEventListener('input', event => mutate(s => { s.note = event.target.value; }));
  function dateLabel(value) { return new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value}T12:00:00`)); }
  function renderHistory() {
    const sessions = Object.entries(data.sessions).sort(([a], [b]) => b.localeCompare(a));
    const records = sessions.map(([id, s]) => ({ id, s, p: plans.find(p => p.id === s.plan) }));
    const completed = records.filter(({ s, p }) => progress(s, p).exercises === 6).length;
    const totalSets = records.reduce((sum, { s, p }) => sum + progress(s, p).sets, 0);
    $('#history-stats').innerHTML = [[sessions.length, 'buổi đã ghi'], [completed, 'buổi hoàn thành'], [totalSets, 'hiệp đã tập']].map(([n, label]) => `<div class="stat"><strong>${n}</strong><span>${label}</span></div>`).join('');
    $('#history-list').innerHTML = records.length ? records.map(({ id, s, p }) => {
      const stats = progress(s, p);
      return `<article class="history-row"><div><span class="history-date">${esc(dateLabel(s.date))}</span><h3>${p.title}</h3><p>${stats.exercises}/6 bài · ${stats.sets}/${stats.total} hiệp</p>${s.note ? `<p>${esc(s.note)}</p>` : ''}</div><button class="outline-button" data-open="${id}">Xem buổi tập →</button></article>`;
    }).join('') : '<div class="empty-state"><strong>Hành trình bắt đầu từ buổi đầu tiên.</strong><p>Ghi một hiệp tập hoặc một dòng ghi chú.<br>Buổi tập của bạn sẽ xuất hiện ở đây.</p><button class="outline-button" data-back>Bắt đầu buổi tập →</button></div>';
  }
  function switchView(view) {
    currentView = view;
    $('#workout-view').hidden = view !== 'workout';
    $('#history-view').hidden = view !== 'history';
    $('#page-title').innerHTML = view === 'workout' ? 'Dành thời gian cho<br>phiên bản khỏe hơn.' : 'Mỗi buổi tập,<br>một dấu mốc của bạn.';
    document.querySelectorAll('[data-view]').forEach(button => {
      button.classList.toggle('active', button.dataset.view === view);
      if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    if (view === 'history') renderHistory();
    else renderWorkout();
  }
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
  $('#history-list').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-back')) switchView('workout');
    else if (button.dataset.open) {
      const s = data.sessions[button.dataset.open];
      date = s.date; planId = s.plan;
      switchView('workout');
      $('#workout-title').scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  });
  $('#export-data').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `nhip-tap-${localDate()}.json`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Đã tạo tệp sao lưu kết quả tập luyện.');
  });
  $('#import-data').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw Error('Tệp quá lớn. Hãy chọn bản sao lưu dưới 10 MB.');
      const imported = validate(JSON.parse(await file.text()));
      data = { version: 1, sessions: { ...data.sessions, ...imported.sessions } };
      persist();
      renderHistory();
      toast(`Đã nhập ${Object.keys(imported.sessions).length} buổi tập${storageBlocked ? ' (đang lưu tạm)' : ''}.`);
    } catch (error) { toast(error instanceof SyntaxError ? 'Tệp không phải JSON hợp lệ. Dữ liệu hiện tại được giữ nguyên.' : error.message); }
    event.target.value = '';
  });
  // Keep changes from another tab visible; reject malformed external records.
  window.addEventListener('storage', event => {
    if (event.key !== storageKey || recoveryLocked) return;
    try {
      data = event.newValue ? validate(JSON.parse(event.newValue)) : { version: 1, sessions: {} };
      if (currentView === 'history') renderHistory(); else renderWorkout();
      toast('Đã cập nhật kết quả từ thẻ khác.');
    } catch { warn('Một thẻ khác gửi dữ liệu không hợp lệ. Kết quả đang hiển thị được giữ nguyên.'); }
  });
  let restSeconds = 90;
  let remaining = restSeconds;
  let deadline = null;
  function renderTimer() {
    const minutes = Math.floor(remaining / 60);
    $('#timer-display').textContent = `${String(minutes).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
    $('#timer-toggle').innerHTML = `${deadline ? 'Tạm dừng' : remaining === 0 ? 'Nghỉ tiếp' : 'Bắt đầu nghỉ'} <span>${deadline ? 'Ⅱ' : '→'}</span>`;
  }
  function tick() {
    if (!deadline) return;
    remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    if (remaining === 0) {
      deadline = null;
      $('#timer-status').textContent = 'Hết giờ nghỉ.';
      toast('Hết giờ nghỉ. Sẵn sàng cho hiệp tiếp theo!');
    }
    renderTimer();
  }
  $('#timer-toggle').addEventListener('click', () => {
    if (deadline) { tick(); deadline = null; }
    else { if (remaining === 0) remaining = restSeconds; deadline = Date.now() + remaining * 1000; $('#timer-status').textContent = 'Đang đếm thời gian nghỉ.'; }
    renderTimer();
  });
  function resetTimer() { deadline = null; remaining = restSeconds; $('#timer-status').textContent = ''; renderTimer(); }
  $('#timer-reset').addEventListener('click', resetTimer);
  document.querySelectorAll('[data-seconds]').forEach(button => button.addEventListener('click', () => {
    restSeconds = Number(button.dataset.seconds);
    document.querySelectorAll('[data-seconds]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    resetTimer();
  }));
  setInterval(tick, 250);
  document.addEventListener('visibilitychange', tick);
  switchView('workout');
  renderTimer();
  if (storageBlocked) $('#footer-status').textContent = 'Chưa lưu trên thiết bị · Cần xuất bản sao lưu';
})();
