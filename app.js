/* ── State ── */
const HABIT_COLORS = [
  '#a78bfa', '#f472b6', '#34d399', '#fb923c',
  '#60a5fa', '#facc15', '#f87171', '#4ade80',
];

let state = loadState();
seedGoals();
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;

function seedGoals() {
  const GOALS = {
    '2026-06-01': [
      { text: '📋 Atualizar LinkedIn — cargo, conquistas, foto e banner', done: false, cat: 'pessoal' },
      { text: '📚 Escolher o livro do mês — separar e começar a leitura', done: false, cat: 'pessoal' },
      { text: '🏋️ Treinar 2x em casa — 20-30 min cada sessão', done: false, cat: 'pessoal' },
      { text: '🥗 Registrar o que está comendo — anotar refeições para a nutri', done: false, cat: 'pessoal' },
      { text: '😴 Definir horário de dormir — testar um horário fixo essa semana', done: false, cat: 'pessoal' },
    ],
    '2026-06-08': [
      { text: '📋 Escrever 1 post no LinkedIn — opinião e aprendizado da área', done: false, cat: 'pessoal' },
      { text: '💰 Listar todos os gastos fixos — assinaturas, aluguel, transporte', done: false, cat: 'pessoal' },
      { text: '🏋️ Treinar 2x em casa — manter a sequência da semana passada', done: false, cat: 'pessoal' },
      { text: '🥗 Consulta com a nutri — trazer registro da semana 1', done: false, cat: 'pessoal' },
      { text: '🎓 Pesquisar 1 curso curto — branding ou estratégia (até 4h)', done: false, cat: 'pessoal' },
    ],
    '2026-06-15': [
      { text: '📋 Conectar com 5 pessoas no LinkedIn — profissionais de marketing e mídia', done: false, cat: 'pessoal' },
      { text: '📚 Ler pelo menos 20 páginas — do livro escolhido na semana 1', done: false, cat: 'pessoal' },
      { text: '🏋️ Treinar 2x em casa — não quebra a sequência', done: false, cat: 'pessoal' },
      { text: '💰 Separar uma reserva mínima — o hábito é o que importa', done: false, cat: 'pessoal' },
      { text: '🥗 Seguir o plano da nutri — primeira semana com o plano em mãos', done: false, cat: 'pessoal' },
      { text: '😴 Avaliar qualidade do sono — o horário fixo está funcionando?', done: false, cat: 'pessoal' },
    ],
    '2026-06-22': [
      { text: '🎓 Iniciar o curso escolhido — completar pelo menos 50% do conteúdo', done: false, cat: 'pessoal' },
      { text: '📚 Finalizar ou avançar no livro — meta: pelo menos metade lida', done: false, cat: 'pessoal' },
      { text: '🏋️ Ir à academia no fim de semana — retomar a academia nos dias livres', done: false, cat: 'pessoal' },
      { text: '📋 Estudar 1 case de social media — uma marca que admira', done: false, cat: 'pessoal' },
      { text: '🥗 Avaliar a primeira semana de dieta — o que foi fácil? o que ajustar?', done: false, cat: 'pessoal' },
    ],
  };

  let changed = false;
  for (const [key, goalTasks] of Object.entries(GOALS)) {
    const existing = state.tasks[key] || [];

    // Migra tarefas antigas que não têm categoria
    existing.forEach(t => { if (!t.cat) { t.cat = 'pessoal'; changed = true; } });

    // Adiciona metas que ainda não existem (compara pelo texto)
    const existingTexts = existing.map(t => t.text);
    goalTasks.forEach(goal => {
      if (!existingTexts.includes(goal.text)) {
        existing.push(goal);
        changed = true;
      }
    });

    state.tasks[key] = existing;
  }
  if (changed) saveState();
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem('planner')) || { tasks: {}, habits: [], habitLog: {} };
  } catch { return { tasks: {}, habits: [], habitLog: {} }; }
}

function saveState() {
  localStorage.setItem('planner', JSON.stringify(state));
}

/* ── Helpers ── */
function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function todayKey() {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
}

function formatTitle(y, m, d) {
  const date = new Date(y, m, d);
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function monthTitle(y, m) {
  return new Date(y, m, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/* ── Star logic ── */
function allPessoalDone(key) {
  const tasks = (state.tasks[key] || []).filter(t => t.cat === 'pessoal');
  return tasks.length > 0 && tasks.every(t => t.done);
}

function updateStarBadge(key) {
  const badge = document.getElementById('starBadge');
  if (!badge) return;
  const earned = allPessoalDone(key);
  badge.classList.toggle('visible', earned);
  if (earned) {
    badge.classList.add('pop');
    setTimeout(() => badge.classList.remove('pop'), 400);
  }
}

/* ── Calendar ── */
function renderCalendar() {
  document.getElementById('monthTitle').textContent = monthTitle(currentYear, currentMonth);

  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();
  const today = todayKey();

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    let day, month = currentMonth, year = currentYear, otherMonth = false;

    if (i < firstDay) {
      day = daysInPrev - firstDay + 1 + i;
      month = currentMonth - 1;
      if (month < 0) { month = 11; year--; }
      otherMonth = true;
    } else if (i >= firstDay + daysInMonth) {
      day = i - firstDay - daysInMonth + 1;
      month = currentMonth + 1;
      if (month > 11) { month = 0; year++; }
      otherMonth = true;
    } else {
      day = i - firstDay + 1;
    }

    const key = dateKey(year, month, day);
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (otherMonth) cell.classList.add('other-month');
    if (key === today) cell.classList.add('today');
    if (key === selectedDate) cell.classList.add('selected');

    // Day number
    const num = document.createElement('div');
    num.className = 'day-number';
    num.textContent = day;
    cell.appendChild(num);

    // Star for days where all pessoal tasks are done
    if (!otherMonth && allPessoalDone(key)) {
      const star = document.createElement('span');
      star.className = 'cell-star';
      star.textContent = '⭐';
      star.title = 'Todas as metas de evolução pessoal concluídas!';
      cell.appendChild(star);
    }

    // Task chips — show trabalho and pessoal with color indicator
    const tasks = state.tasks[key] || [];
    if (tasks.length) {
      const chipBox = document.createElement('div');
      chipBox.className = 'cell-tasks';
      const visible = tasks.slice(0, 2);
      visible.forEach(t => {
        const chip = document.createElement('div');
        chip.className = 'cell-task-chip' + (t.done ? ' done' : '') + (t.cat === 'trabalho' ? ' chip-trabalho' : ' chip-pessoal');
        chip.textContent = t.text;
        chipBox.appendChild(chip);
      });
      if (tasks.length > 2) {
        const more = document.createElement('div');
        more.className = 'cell-task-more';
        more.textContent = `+${tasks.length - 2} mais`;
        chipBox.appendChild(more);
      }
      cell.appendChild(chipBox);
    }

    // Habit dots
    if (state.habits.length) {
      const dotBox = document.createElement('div');
      dotBox.className = 'cell-habits';
      state.habits.forEach(h => {
        const dot = document.createElement('div');
        dot.className = 'habit-dot-cell' + (isHabitDone(key, h.id) ? ' done' : '');
        dot.style.background = h.color;
        dot.title = h.name;
        dotBox.appendChild(dot);
      });
      cell.appendChild(dotBox);
    }

    if (!otherMonth) {
      cell.addEventListener('click', () => selectDay(year, month, day));
    }

    grid.appendChild(cell);
  }

  renderHabitLegend();
}

/* ── Day selection ── */
function selectDay(y, m, d) {
  selectedDate = dateKey(y, m, d);
  renderCalendar();
  renderDayPanel(y, m, d);
}

function renderDayPanel(y, m, d) {
  const key = dateKey(y, m, d);
  document.getElementById('dayPanelTitle').textContent = formatTitle(y, m, d);
  renderTaskList(key, 'trabalho');
  renderTaskList(key, 'pessoal');
  renderHabitCheckList(key);
  updateStarBadge(key);
}

/* ── Tasks ── */
function renderTaskList(key, cat) {
  const listId = cat === 'trabalho' ? 'taskListTrabalho' : 'taskListPessoal';
  const list = document.getElementById(listId);
  list.innerHTML = '';
  const tasks = (state.tasks[key] || []).filter(t => t.cat === cat);
  const allTasks = state.tasks[key] || [];

  tasks.forEach(task => {
    const idx = allTasks.indexOf(task);
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = task.done;
    cb.id = `task-${cat}-${idx}`;
    cb.addEventListener('change', () => {
      allTasks[idx].done = cb.checked;
      saveState();
      renderTaskList(key, cat);
      renderCalendar();
      updateStarBadge(key);
    });

    const label = document.createElement('label');
    label.htmlFor = `task-${cat}-${idx}`;
    label.textContent = task.text;

    const del = document.createElement('button');
    del.className = 'del-btn';
    del.textContent = '×';
    del.addEventListener('click', () => {
      allTasks.splice(idx, 1);
      saveState();
      renderTaskList(key, cat);
      renderCalendar();
      updateStarBadge(key);
    });

    li.appendChild(cb);
    li.appendChild(label);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function addTask(cat) {
  if (!selectedDate) return;
  const inputId = cat === 'trabalho' ? 'taskInputTrabalho' : 'taskInputPessoal';
  const input = document.getElementById(inputId);
  const text = input.value.trim();
  if (!text) return;
  if (!state.tasks[selectedDate]) state.tasks[selectedDate] = [];
  state.tasks[selectedDate].push({ text, done: false, cat });
  input.value = '';
  saveState();
  renderTaskList(selectedDate, cat);
  renderCalendar();
  updateStarBadge(selectedDate);
}

/* ── Habits manager ── */
function renderHabitList() {
  const list = document.getElementById('habitList');
  list.innerHTML = '';
  state.habits.forEach((h, idx) => {
    const li = document.createElement('li');
    li.className = 'habit-list-item';

    const dot = document.createElement('span');
    dot.className = 'habit-dot';
    dot.style.background = h.color;

    const name = document.createElement('span');
    name.textContent = h.name;

    const del = document.createElement('button');
    del.className = 'del-btn';
    del.textContent = '×';
    del.addEventListener('click', () => {
      state.habits.splice(idx, 1);
      saveState();
      renderHabitList();
      if (selectedDate) renderHabitCheckList(selectedDate);
      renderCalendar();
    });

    li.appendChild(dot);
    li.appendChild(name);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function addHabit() {
  const input = document.getElementById('habitInput');
  const name = input.value.trim();
  if (!name) return;
  const color = HABIT_COLORS[state.habits.length % HABIT_COLORS.length];
  state.habits.push({ id: Date.now(), name, color });
  input.value = '';
  saveState();
  renderHabitList();
  if (selectedDate) renderHabitCheckList(selectedDate);
  renderCalendar();
}

/* ── Habit log (per day) ── */
function isHabitDone(dateKey, habitId) {
  return !!(state.habitLog[dateKey] && state.habitLog[dateKey][habitId]);
}

function renderHabitCheckList(key) {
  const list = document.getElementById('habitCheckList');
  list.innerHTML = '';
  if (!state.habits.length) {
    const empty = document.createElement('li');
    empty.style.cssText = 'font-size:0.8rem;color:var(--text-muted)';
    empty.textContent = 'Nenhum hábito cadastrado ainda.';
    list.appendChild(empty);
    return;
  }
  state.habits.forEach(h => {
    const li = document.createElement('li');
    const done = isHabitDone(key, h.id);
    li.className = 'habit-check-item' + (done ? ' done' : '');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = done;
    cb.id = `hc-${h.id}`;
    cb.addEventListener('change', () => {
      if (!state.habitLog[key]) state.habitLog[key] = {};
      state.habitLog[key][h.id] = cb.checked;
      saveState();
      renderHabitCheckList(key);
      renderCalendar();
    });

    const dot = document.createElement('span');
    dot.className = 'habit-dot';
    dot.style.cssText = `background:${h.color};width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0`;

    const label = document.createElement('label');
    label.htmlFor = `hc-${h.id}`;
    label.textContent = h.name;

    li.appendChild(cb);
    li.appendChild(dot);
    li.appendChild(label);
    list.appendChild(li);
  });
}

/* ── Habit legend ── */
function renderHabitLegend() {
  const legend = document.getElementById('habitLegend');
  legend.innerHTML = '';
  if (!state.habits.length) return;
  state.habits.forEach(h => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    const dot = document.createElement('span');
    dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${h.color};display:inline-block`;
    const name = document.createElement('span');
    name.textContent = h.name;
    item.appendChild(dot);
    item.appendChild(name);
    legend.appendChild(item);
  });
}

/* ── Event listeners ── */
document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
});

document.querySelector('[data-cat="trabalho"]').addEventListener('click', () => addTask('trabalho'));
document.getElementById('taskInputTrabalho').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask('trabalho');
});

document.querySelector('[data-cat="pessoal"]').addEventListener('click', () => addTask('pessoal'));
document.getElementById('taskInputPessoal').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask('pessoal');
});

document.getElementById('addHabitBtn').addEventListener('click', addHabit);
document.getElementById('habitInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addHabit();
});

/* ── Init ── */
renderCalendar();
renderHabitList();

const t = new Date();
selectDay(t.getFullYear(), t.getMonth(), t.getDate());
