/* ══════════════════════════════════════════════
   MY PLANNER — app.js
══════════════════════════════════════════════ */

/* ══════════════════════
   CLOCK
══════════════════════ */
function updateClock() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  document.getElementById('clock').textContent =
    `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
  const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  document.getElementById('day-label').textContent = days[now.getDay()];
}
updateClock();
setInterval(updateClock, 1000);

/* ══════════════════════
   TAB SWITCHING
══════════════════════ */
const tabInfo = {
  todo:     { title: 'To Do List',      sub: 'Stay focused, you got this! 🌟' },
  habit:    { title: 'Habit Tracker',   sub: 'Build good habits, one day at a time 🌿' },
  academic: { title: 'Academics',       sub: 'Track subjects, grades & assignments 🎓' },
  weekly:   { title: 'Weekly Planner',  sub: 'Plan your perfect week ✨' }
};

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('page-title').textContent = tabInfo[name].title;
  document.getElementById('page-sub').textContent   = tabInfo[name].sub;
  if (name === 'weekly') renderWeek();
  if (name === 'habit')  renderHabits();
}

/* ══════════════════════
   STORAGE HELPERS
══════════════════════ */
function load(k, def) {
  try { return JSON.parse(localStorage.getItem(k)) || def; }
  catch { return def; }
}
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function fmtDate(d) {
  const [y, m, day] = d.split('-');
  const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${mo[+m - 1]} ${+day}`;
}

/* ══════════════════════════════════════════════
   TO DO LIST
══════════════════════════════════════════════ */
let todos = load('my-todos', []);
let todoFilter = 'all';

// Set today's date as default
document.getElementById('t-due').valueAsDate = new Date();

// Seed default tasks if empty
if (!todos.length) {
  todos = [
    { id: 1, name: 'Read chapter 5 of textbook', category: 'study',    priority: 'high',   due: new Date().toISOString().split('T')[0], done: false },
    { id: 2, name: 'Morning yoga & stretching',   category: 'health',   priority: 'medium', due: new Date().toISOString().split('T')[0], done: true  },
    { id: 3, name: 'Finish project proposal',     category: 'work',     priority: 'high',   due: new Date().toISOString().split('T')[0], done: false },
    { id: 4, name: 'Call mom 📞',                 category: 'personal', priority: 'low',    due: '',                                     done: false },
  ];
  save('my-todos', todos);
}

function addTodo() {
  const inp  = document.getElementById('t-inp');
  const name = inp.value.trim();
  if (!name) {
    inp.style.borderColor = '#f0a0a0';
    setTimeout(() => inp.style.borderColor = '', 900);
    return;
  }
  todos.unshift({
    id:       Date.now(),
    name,
    category: document.getElementById('t-cat').value,
    priority: document.getElementById('t-pri').value,
    due:      document.getElementById('t-due').value,
    done:     false
  });
  inp.value = '';
  save('my-todos', todos);
  renderTodos();
}

document.getElementById('t-inp').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

function toggleTodo(id) {
  const t = todos.find(t => t.id === id);
  if (t) { t.done = !t.done; save('my-todos', todos); renderTodos(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save('my-todos', todos);
  renderTodos();
}

document.getElementById('t-pills').addEventListener('click', e => {
  const pill = e.target.closest('[data-f]');
  if (!pill) return;
  document.querySelectorAll('#t-pills .pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  todoFilter = pill.dataset.f;
  renderTodos();
});

function renderTodos() {
  let filtered = todos;
  if (todoFilter === 'active') filtered = todos.filter(t => !t.done);
  else if (todoFilter === 'done') filtered = todos.filter(t => t.done);
  else if (!['all', 'active', 'done'].includes(todoFilter))
    filtered = todos.filter(t => t.category === todoFilter);

  document.getElementById('t-count').textContent = filtered.length;
  const total = todos.length;
  const done  = todos.filter(t => t.done).length;
  document.getElementById('t-total').textContent = total;
  document.getElementById('t-done').textContent  = done;
  document.getElementById('t-left').textContent  = total - done;
  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById('t-pct').textContent    = pct + '%';
  document.getElementById('t-bar').style.width    = pct + '%';

  const catCls = { work: 'tag-work', personal: 'tag-personal', study: 'tag-study', health: 'tag-health' };
  const catLbl = { work: '💼 Work', personal: '🌸 Personal', study: '📚 Study', health: '🍎 Health' };
  const priCls = { high: 'p-high', medium: 'p-medium', low: 'p-low' };
  const priLbl = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };

  const el = document.getElementById('t-list');
  if (!filtered.length) {
    el.innerHTML = `<div class="empty"><div class="ej">🌸</div><p>No tasks here yet!<br>Add something wonderful ✨</p></div>`;
    return;
  }
  el.innerHTML = filtered.map(t => `
    <div class="task-card ${t.done ? 'done' : ''}">
      <div class="chk ${t.done ? 'checked' : ''}" onclick="toggleTodo(${t.id})"></div>
      <div class="task-info">
        <div class="task-name">${esc(t.name)}</div>
        <div class="task-meta">
          <span class="tag ${catCls[t.category]}">${catLbl[t.category]}</span>
          <span class="pri ${priCls[t.priority]}">${priLbl[t.priority]}</span>
          ${t.due ? `<span class="task-due">📅 ${fmtDate(t.due)}</span>` : ''}
        </div>
      </div>
      <button class="btn-del" onclick="deleteTodo(${t.id})">🗑️</button>
    </div>`).join('');
}
renderTodos();

/* ══════════════════════════════════════════════
   HABIT TRACKER
══════════════════════════════════════════════ */
let habits = load('my-habits', []);

// Seed default habits if empty
if (!habits.length) {
  habits = [
    { id: 1, name: 'Morning Walk',               icon: '🏃', checks: {} },
    { id: 2, name: 'Read 20 min',                icon: '📚', checks: {} },
    { id: 3, name: 'Drink 8 glasses of water',   icon: '💧', checks: {} },
    { id: 4, name: '10 min Meditation',          icon: '🧘', checks: {} },
  ];
  save('my-habits', habits);
}

function addHabit() {
  const inp  = document.getElementById('h-inp');
  const name = inp.value.trim();
  if (!name) {
    inp.style.borderColor = '#f0a0a0';
    setTimeout(() => inp.style.borderColor = '', 900);
    return;
  }
  habits.push({ id: Date.now(), name, icon: document.getElementById('h-icon').value, checks: {} });
  inp.value = '';
  save('my-habits', habits);
  renderHabits();
}

function deleteHabit(id) {
  habits = habits.filter(h => h.id !== id);
  save('my-habits', habits);
  renderHabits();
}

function toggleHabitDay(id, dateStr) {
  const h = habits.find(h => h.id === id);
  if (!h) return;
  h.checks[dateStr] = !h.checks[dateStr];
  save('my-habits', habits);
  renderHabits();
}

function getWeekDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - dow + i);
    dates.push(d);
  }
  return dates;
}

function getStreak(h) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let d = new Date(today);
  while (true) {
    const k = d.toISOString().split('T')[0];
    if (h.checks[k]) streak++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function renderHabits() {
  const weekDates = getWeekDates();
  const todayStr  = new Date().toISOString().split('T')[0];
  const dayNames  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const doneToday  = habits.filter(h => h.checks[todayStr]).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h)), 0);

  document.getElementById('h-total').textContent  = habits.length;
  document.getElementById('h-today').textContent  = doneToday;
  document.getElementById('h-streak').textContent = bestStreak;

  const el = document.getElementById('h-list');
  if (!habits.length) {
    el.innerHTML = `<div class="empty"><div class="ej">🌿</div><p>No habits yet!<br>Add your first habit ✨</p></div>`;
    return;
  }

  el.innerHTML = habits.map(h => {
    const streak = getStreak(h);
    const dots = weekDates.map((d, i) => {
      const k       = d.toISOString().split('T')[0];
      const isToday = k === todayStr;
      const checked = h.checks[k];
      return `<div class="day-dot ${checked ? 'checked' : ''} ${isToday ? 'today' : ''}"
                   onclick="toggleHabitDay(${h.id},'${k}')" title="${dayNames[i]}">
        <span class="dnum">${d.getDate()}</span>
        <span>${dayNames[i]}</span>
      </div>`;
    }).join('');

    return `<div class="habit-card">
      <div class="habit-top">
        <div class="habit-icon">${h.icon}</div>
        <div>
          <div class="habit-name">${esc(h.name)}</div>
          <div class="habit-streak">🔥 ${streak} day streak</div>
        </div>
        <button class="habit-del" onclick="deleteHabit(${h.id})">🗑️</button>
      </div>
      <div class="habit-days">${dots}</div>
    </div>`;
  }).join('');
}
renderHabits();

/* ══════════════════════════════════════════════
   ACADEMICS
══════════════════════════════════════════════ */
let subjects = load('my-subjects', []);

// Seed default subjects if empty
if (!subjects.length) {
  subjects = [
    { id: 1, name: 'Mathematics', color: '#aec6d4', grade: 85, tasks: [
        { id: 1, name: 'Complete problem set 4',  done: false },
        { id: 2, name: 'Review calculus notes',   done: true  }
      ]
    },
    { id: 2, name: 'Literature', color: '#f2d5d0', grade: 92, tasks: [
        { id: 3, name: 'Essay draft due Friday',  done: false }
      ]
    },
    { id: 3, name: 'Biology', color: '#c5d9c0', grade: 78, tasks: [
        { id: 4, name: 'Lab report',              done: true  },
        { id: 5, name: 'Read chapter 8',          done: false }
      ]
    },
  ];
  save('my-subjects', subjects);
}

function addSubject() {
  const inp  = document.getElementById('a-inp');
  const name = inp.value.trim();
  if (!name) {
    inp.style.borderColor = '#f0a0a0';
    setTimeout(() => inp.style.borderColor = '', 900);
    return;
  }
  subjects.push({
    id:    Date.now(),
    name,
    color: document.getElementById('a-color').value,
    grade: '',
    tasks: []
  });
  inp.value = '';
  save('my-subjects', subjects);
  renderSubjects();
}

function deleteSubject(id) {
  subjects = subjects.filter(s => s.id !== id);
  save('my-subjects', subjects);
  renderSubjects();
}

function addSubjectTask(sid) {
  const inp  = document.getElementById('st-inp-' + sid);
  const name = inp.value.trim();
  if (!name) return;
  const s = subjects.find(s => s.id === sid);
  if (!s) return;
  s.tasks.push({ id: Date.now(), name, done: false });
  inp.value = '';
  save('my-subjects', subjects);
  renderSubjects();
}

function toggleSubjectTask(sid, tid) {
  const s = subjects.find(s => s.id === sid);
  if (!s) return;
  const t = s.tasks.find(t => t.id === tid);
  if (!t) return;
  t.done = !t.done;
  save('my-subjects', subjects);
  renderSubjects();
}

function deleteSubjectTask(sid, tid) {
  const s = subjects.find(s => s.id === sid);
  if (!s) return;
  s.tasks = s.tasks.filter(t => t.id !== tid);
  save('my-subjects', subjects);
  renderSubjects();
}

function updateGrade(sid, val) {
  const s = subjects.find(s => s.id === sid);
  if (!s) return;
  s.grade = val;
  save('my-subjects', subjects);
  updateAcadStats();
}

function updateAcadStats() {
  const grades   = subjects.map(s => parseFloat(s.grade)).filter(g => !isNaN(g));
  const avg      = grades.length ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null;
  const allTasks = subjects.flatMap(s => s.tasks);
  document.getElementById('a-subj').textContent  = subjects.length;
  document.getElementById('a-tasks').textContent = allTasks.filter(t => t.done).length;
  document.getElementById('a-gpa').textContent   = avg !== null ? avg + '%' : '—';
  document.getElementById('a-count').textContent = subjects.length;
}

function renderSubjects() {
  updateAcadStats();
  const el = document.getElementById('a-list');
  if (!subjects.length) {
    el.innerHTML = `<div class="empty"><div class="ej">🎓</div><p>No subjects yet!<br>Add your first subject ✨</p></div>`;
    return;
  }
  el.innerHTML = subjects.map(s => {
    const doneCnt = s.tasks.filter(t => t.done).length;
    const tasks   = s.tasks.map(t => `
      <div class="subj-task">
        <div class="chk ${t.done ? 'checked' : ''}"
             onclick="toggleSubjectTask(${s.id},${t.id})"
             style="width:16px;height:16px;border-radius:5px;border:2px solid var(--blue);
                    display:flex;align-items:center;justify-content:center;cursor:pointer;
                    flex-shrink:0;${t.done ? 'background:var(--blue)' : ''}">
          ${t.done ? '<span style="color:#fff;font-size:10px;font-weight:900">✓</span>' : ''}
        </div>
        <span style="${t.done ? 'text-decoration:line-through;color:var(--soft)' : ''};flex:1">${esc(t.name)}</span>
        <button class="btn-del" onclick="deleteSubjectTask(${s.id},${t.id})" style="font-size:12px">🗑️</button>
      </div>`).join('');

    return `<div class="subject-card">
      <div class="subj-header">
        <div class="subj-color" style="background:${s.color}"></div>
        <div class="subj-name">${esc(s.name)}</div>
        <div style="display:flex;align-items:center;gap:10px">
          <input type="number" class="sel grade-inp"
                 value="${s.grade}" placeholder="Grade%" min="0" max="100"
                 onchange="updateGrade(${s.id},this.value)"
                 style="width:80px;text-align:center">
          <button class="btn-del" onclick="deleteSubject(${s.id})" style="font-size:14px">🗑️</button>
        </div>
      </div>
      <div style="font-size:11px;color:var(--soft);margin-bottom:6px">📋 ${doneCnt}/${s.tasks.length} tasks done</div>
      <div class="subj-tasks">${tasks || '<div style="font-size:12px;color:var(--soft);padding:4px 0">No assignments yet 🌸</div>'}</div>
      <div class="add-task-line">
        <input type="text" class="inp" id="st-inp-${s.id}"
               placeholder="Add assignment..." style="font-size:12px"
               onkeydown="if(event.key==='Enter') addSubjectTask(${s.id})">
        <button class="btn btn-blue btn-sm" onclick="addSubjectTask(${s.id})">+ Add</button>
      </div>
    </div>`;
  }).join('');
}
renderSubjects();

/* ══════════════════════════════════════════════
   WEEKLY PLANNER
══════════════════════════════════════════════ */
let weekOffset  = 0;
let weekEvents  = load('my-week-events', {});
let addingToDay = null;

function getWeekStart(offset) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow   = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - dow + offset * 7);
  return start;
}

function changeWeek(dir) {
  if (dir === 0) weekOffset = 0;
  else weekOffset += dir;
  renderWeek();
}

function renderWeek() {
  const start    = getWeekStart(weekOffset);
  const todayStr = new Date().toISOString().split('T')[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  document.getElementById('week-label').textContent =
    `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;

  const grid = document.getElementById('week-grid');
  let html = '';
  for (let i = 0; i < 7; i++) {
    const d       = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === todayStr;
    const events  = weekEvents[dateStr] || [];
    const evHtml  = events.map((ev, idx) => `
      <div class="week-event ${ev.type || ''}">
        <span>${ev.time ? ev.time + ' ' : ''}${esc(ev.title)}</span>
        <button class="ev-del" onclick="deleteEvent('${dateStr}',${idx})">✕</button>
      </div>`).join('');

    html += `<div class="day-col ${isToday ? 'today-col' : ''}">
      <div class="day-header">
        <div class="day-name">${dayNames[i]}</div>
        <div class="day-num">${d.getDate()}</div>
      </div>
      ${evHtml}
      <button class="add-ev-btn" onclick="openModal('${dateStr}')">+</button>
    </div>`;
  }
  grid.innerHTML = html;
}

function openModal(dateStr) {
  addingToDay = dateStr;
  document.getElementById('ev-title').value = '';
  document.getElementById('ev-time').value  = '';
  document.getElementById('ev-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('ev-title').focus(), 100);
}

function closeModal() {
  document.getElementById('ev-modal').style.display = 'none';
  addingToDay = null;
}

function saveEvent() {
  const title = document.getElementById('ev-title').value.trim();
  if (!title) return;
  const time = document.getElementById('ev-time').value;
  const type = document.getElementById('ev-type').value;
  if (!weekEvents[addingToDay]) weekEvents[addingToDay] = [];
  weekEvents[addingToDay].push({ title, time, type });
  save('my-week-events', weekEvents);
  closeModal();
  renderWeek();
}

function deleteEvent(dateStr, idx) {
  weekEvents[dateStr].splice(idx, 1);
  save('my-week-events', weekEvents);
  renderWeek();
}

document.getElementById('ev-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('ev-modal')) closeModal();
});
document.getElementById('ev-title').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveEvent();
});

renderWeek();
