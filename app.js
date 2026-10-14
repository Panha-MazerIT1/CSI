// ===== ដាក់ព័ត៌មាន Supabase របស់អ្នកនៅទីនេះ =====
const SUPABASE_URL = "https://fyrofappoidfaogzhdlm.supabase.co";
const SUPABASE_KEY = "sb_publishable_dc-70zNaPuGJHsuolZvfEw_CjiUJ8ku";
// SUPABASE_URL និង SUPABASE_KEY ត្រូវមកពី config.js (ដូចមុន)
const LOGO_URL = 'https://fyrofappoidfaogzhdlm.supabase.co/storage/v1/object/sign/logo/New%20Tyn%20Logo%20-%20New.png?token=eyJraWQiOiIwZDhiMjI2Yi1hZDU3LTRkZTEtOGM1OS02YTFjNjY4NzkzNTgiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJsb2dvL05ldyBUeW4gTG9nbyAtIE5ldy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkxNjE1NjY1LCJleHAiOjE4MjMxNTE2NjV9.8qEkk5pKOO0siU7h7p8sp22LhTOinerfqDq027lJLxqhEDup_Qv9Ct8FkFPa1aiU2RsU7gU_fKPQdkc0BVONQw';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $app = document.getElementById('app');

// ✅ Font — ត្រូវដូចប្រព័ន្ធគ្រប់គ្រងវត្តមាន (ប្តូរតែឈ្មោះនៅបន្ទាត់ខាងក្រោម)
const APP_FONT = 'Battambang';
document.head.insertAdjacentHTML('beforeend',
  `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${APP_FONT.replace(/ /g, '+')}:wght@400;700&display=swap">` +
  `<style>body,body *{font-family:'${APP_FONT}','Noto Sans Khmer',system-ui,sans-serif!important}body{background:#f3f5f9!important}</style>`);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const COURSES = [
  "We start English for Beginner Level 1",
  "English Standard for practice Level 2",
  "English Standard for practice Level 3",
  "Effective English Practice and Pronunciation Level 4"
];
const CLASS_RANKS = ['១', '២', '៣', '៤', '៥'];
const IMPORT_RANK = '៥';
const KH_DIGITS = '០១២៣៤៥៦៧៨៩';
const KH_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

const khmerCollator = new Intl.Collator('km-KH', { sensitivity: 'base', numeric: true });
const sortByKhmerName = (a, b) => khmerCollator.compare(a.name || '', b.name || '');

const C = {
  input: 'w-full border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/15 focus:border-brand transition text-sm',
  btn: 'bg-brand text-white rounded-xl px-4 py-2.5 hover:brightness-110 active:scale-95 transition font-semibold text-sm shadow-sm',
  btnAccent: 'bg-accent text-white rounded-xl px-4 py-2.5 hover:brightness-110 active:scale-95 transition font-semibold text-sm shadow-sm',
  ghost: 'bg-white text-brand border border-brand/40 rounded-xl px-4 py-2.5 hover:bg-brand/5 hover:border-brand active:scale-95 transition font-semibold text-sm',
  edit: 'bg-brand/10 text-brand rounded-lg px-3 py-1.5 hover:bg-brand/20 transition text-xs font-semibold',
  del: 'bg-red-50 text-accent rounded-lg px-3 py-1.5 hover:bg-red-100 transition text-xs font-semibold',
  save: 'bg-emerald-600 text-white rounded-lg px-3 py-1.5 hover:bg-emerald-700 transition text-xs font-semibold',
  cancel: 'bg-slate-200 text-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-300 transition text-xs font-semibold',
  card: 'bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.08)]',
  form: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.08)]',
  th: 'bg-brand text-white text-left px-4 py-3 text-xs font-semibold whitespace-nowrap',
  td: 'px-4 py-3 border-t border-slate-100 text-sm',
  tabActive: 'bg-brand text-white shadow-sm',
  tabInactive: 'text-slate-600 hover:bg-slate-100'
};

// ---------- ជំនួយ ----------
const norm = v => String(v ?? '').replace(/\s+/g, '');
const toKh = v => norm(v).replace(/[0-9]/g, d => KH_DIGITS[d]);
const toAscii = v => String(v ?? '').replace(/[០-៩]/g, d => KH_DIGITS.indexOf(d));
const khNum = n => String(n).replace(/\d/g, d => KH_DIGITS[d]);

function formatKhmerDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
  return m ? `${khNum(+m[3])}-${KH_MONTHS[+m[2] - 1]}-${khNum(m[1])}` : (s || '');
}

let me, teachers = [], students = [], monthlyStudents = [], filter = '', activeTab = 'quarterly', editingId = null;

const selS = new Set(), selT = new Set();   // ការជ្រើសរើស: សិស្ស / គ្រូ
const FORM_IDS = ['a_n', 'a_t', 'a_c', 'a_g', 'a_d', 'a_o', 'a_tn', 't_n', 't_e', 't_p'];
// render ឡើងវិញ តែរក្សាអ្វីដែលកំពុងវាយក្នុងទម្រង់
function rerender() {
  const v = Object.fromEntries(FORM_IDS.map(id => [id, document.getElementById(id)?.value]));
  render();
  FORM_IDS.forEach(id => { const el = document.getElementById(id); if (el && v[id] !== undefined) el.value = v[id]; });
}
const isQ = () => activeTab === 'quarterly';
const isAdmin = () => me.role === 'admin';
const tname = id => (teachers.find(t => t.id === id) || {}).name || '';
const myTeachers = () => teachers.filter(t => t.id !== me.id);
const tOpts = sel => myTeachers().map(t => `<option value="${t.id}" ${t.id === sel ? 'selected' : ''}>${esc(t.name)}</option>`).join('');
const shown = () => (isQ() ? students : monthlyStudents).filter(s => !filter || s.teacher_id === filter);
// តម្រៀប៖ សិស្សរបស់គ្រូម្នាក់ៗនៅជាប់គ្នា (តាម teacher_id ពិតប្រាកដ)
const SORT_WITHIN = 'entry'; // 'entry' = តាមលំដាប់បញ្ចូល/នាំចូល (ដូច Google Sheet) · 'name' = តាមអក្ខរក្រមខ្មែរ
const tIndex = id => { const i = teachers.findIndex(t => t.id === id); return i < 0 ? 9999 : i; };
const byTeacherThenName = (a, b) => (tIndex(a.teacher_id) - tIndex(b.teacher_id)) ||
  (SORT_WITHIN === 'name' ? sortByKhmerName(a, b) : Number(a.id) - Number(b.id));
const T_CLR = ['bg-rose-100 text-rose-800', 'bg-sky-100 text-sky-800', 'bg-emerald-100 text-emerald-800', 'bg-amber-100 text-amber-800', 'bg-violet-100 text-violet-800', 'bg-teal-100 text-teal-800', 'bg-orange-100 text-orange-800', 'bg-indigo-100 text-indigo-800'];
const teacherPill = id => `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${T_CLR[tIndex(id) % T_CLR.length]}">${esc(tname(id))}</span>`;

// ---------- ចូលប្រព័ន្ធ ----------
async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return showLogin();
  const { data: p } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
  if (!p) {
    await sb.auth.signOut();
    return showLogin('គណនីនេះមិនទាន់មានសិទ្ធិប្រើប្រាស់ទេ សូមទាក់ទងអ្នកគ្រប់គ្រង');
  }
  me = p;
  await load();
  render();
  startRealtime();
}

function showLogin(err = '') {
  $app.innerHTML = `
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-slate-100">
    <form id="lf" class="w-full max-w-md grid gap-4 p-6 sm:p-8 ${C.card} shadow-xl">
      <div class="flex flex-col items-center gap-3 mb-2">
        <img src="${LOGO_URL}" alt="Logo" class="h-24 sm:h-32 w-auto object-contain" onerror="this.style.display='none'">
        <h1 class="text-xl font-bold text-brand text-center">ប្រព័ន្ធទិន្នន័យសិស្ស</h1>
        <p class="text-xs text-slate-500">សាលាអន្តរទ្វីប ខូស្បេស៍</p>
      </div>
      <input id="em" type="email" placeholder="អ៊ីមែល" required class="${C.input}">
      <input id="pw" type="password" placeholder="ពាក្យសម្ងាត់" required class="${C.input}">
      <button class="${C.btn}">ចូលប្រើប្រាស់</button>
      <p id="lm" class="text-red-600 text-sm text-center min-h-[1.2em]">${esc(err)}</p>
    </form>
  </div>`;
  document.getElementById('lf').onsubmit = async e => {
    e.preventDefault();
    const { error } = await sb.auth.signInWithPassword({ email: em.value, password: pw.value });
    if (error) { console.error(error); lm.textContent = 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ'; }
    else init();
  };
}

// ---------- ទាញទិន្នន័យ (តែរបស់ខ្លួន និងគ្រូរបស់ខ្លួន) ----------
async function load() {
  const { data: t, error } = await sb.from('profiles').select('*').or(`id.eq.${me.id},parent_admin_id.eq.${me.id}`);
  if (error) alert('មិនអាចទាញយកគ្រូបានទេ: ' + error.message);
  teachers = (t || []).sort(sortByKhmerName);
  const ids = teachers.map(x => x.id);
  if (!ids.length) { students = []; monthlyStudents = []; selS.clear(); selT.clear(); return; }
  const get = async table => ((await sb.from(table).select('*').in('teacher_id', ids)).data || []).sort(byTeacherThenName);
  [students, monthlyStudents] = await Promise.all([get('students'), get('monthly_students')]);
  const cur = new Set((isQ() ? students : monthlyStudents).map(x => String(x.id)));
  [...selS].forEach(id => { if (!cur.has(id)) selS.delete(id); });
  [...selT].forEach(id => { if (!teachers.some(t => t.id === id)) selT.delete(id); });
}

// ---------- បង្ហាញ ----------
const td = (label, html, cls = '') => `<td class="${C.td} ${cls}" data-label="${label}">${html}</td>`;
const RANK_CLR = { '១': 'bg-slate-100 text-slate-700', '២': 'bg-sky-100 text-sky-700', '៣': 'bg-emerald-100 text-emerald-700', '៤': 'bg-amber-100 text-amber-700', '៥': 'bg-rose-100 text-rose-700' };
const rankBadge = v => `<span class="inline-flex items-center justify-center min-w-[1.75rem] px-2 py-0.5 rounded-full text-xs font-bold ${RANK_CLR[v] || 'bg-slate-100 text-slate-700'}">${esc(v)}</span>`;
const stat = (label, value, clr) => `<div class="${C.card} p-4 flex items-center gap-3"><span class="w-1.5 h-10 rounded-full ${clr}"></span><div><p class="text-xs text-slate-500">${label}</p><p class="text-2xl font-bold text-slate-800 leading-tight">${khNum(value)}</p></div></div>`;
const heads = () => isQ()
  ? ['ល.រ', 'ឈ្មោះ', 'ភេទ', 'ចំណាត់ថ្នាក់', 'ថ្ងៃខែឆ្នាំកំណើត', 'វគ្គសិក្សា', 'ឈ្មោះគ្រូ', 'សកម្មភាព']
  : ['ល.រ', 'ឈ្មោះ', 'ចំណាត់ថ្នាក់', 'ឈ្មោះគ្រូ', 'សកម្មភាព'];

function viewRow(s, i, groupStart = false) {
  const q = isQ();
  return `<tr class="bg-white hover:bg-brand/5 transition ${groupStart ? 'border-t-2 border-slate-300' : ''}">
    ${td('ជ្រើស', `<input type="checkbox" class="w-4 h-4 accent-brand" data-sel="${s.id}" ${selS.has(String(s.id)) ? 'checked' : ''}>`)}
    ${td('ល.រ', i + 1)}
    ${td('ឈ្មោះ', esc(s.name), 'font-medium')}
    ${q ? td('ភេទ', esc(s.gender)) : ''}
    ${td('ចំណាត់ថ្នាក់', rankBadge(s.class_no))}
    ${q ? td('ថ្ងៃខែឆ្នាំកំណើត', esc(formatKhmerDate(s.dob))) + td('វគ្គសិក្សា', esc(s.course), 'text-slate-600 text-xs') : ''}
    ${td('ឈ្មោះគ្រូ', teacherPill(s.teacher_id))}
    ${td('សកម្មភាព', `<button class="${C.edit}" data-edit="${s.id}">កែ</button> <button class="${C.del}" data-id="${s.id}">លុប</button>`, 'whitespace-nowrap')}
  </tr>`;
}

function editRow(s, i) {
  const q = isQ();
  return `<tr class="bg-yellow-50">
    ${td('ជ្រើស', '')}
    ${td('ល.រ', i + 1)}
    ${td('ឈ្មោះ', `<input id="e_n_${s.id}" value="${esc(s.name)}" class="${C.input}">`)}
    ${q ? td('ភេទ', `<select id="e_g_${s.id}" class="${C.input}"><option ${s.gender === 'ស្រី' ? 'selected' : ''}>ស្រី</option><option ${s.gender === 'ប្រុស' ? 'selected' : ''}>ប្រុស</option></select>`) : ''}
    ${td('ចំណាត់ថ្នាក់', `<select id="e_c_${s.id}" class="${C.input}">${CLASS_RANKS.map(r => `<option ${s.class_no === r ? 'selected' : ''}>${r}</option>`).join('')}</select>`)}
    ${q ? td('ថ្ងៃខែឆ្នាំកំណើត', `<input id="e_d_${s.id}" type="date" value="${s.dob || ''}" class="${C.input}">`) + td('វគ្គសិក្សា', `<input id="e_o_${s.id}" value="${esc(s.course)}" class="${C.input}">`) : ''}
    ${td('ឈ្មោះគ្រូ', isAdmin() ? `<select id="e_t_${s.id}" class="${C.input}">${tOpts(s.teacher_id)}</select>` : esc(tname(s.teacher_id)))}
    ${td('សកម្មភាព', `<button class="${C.save}" data-save="${s.id}">រក្សាទុក</button> <button class="${C.cancel}" data-cancel="1">បោះបង់</button>`, 'whitespace-nowrap')}
  </tr>`;
}

function render() {
  const q = isQ(), rows = shown(), label = q ? 'ប្រចាំត្រីមាស' : 'ប្រចាំខែ';
  $app.innerHTML = `
  <header class="bg-gradient-to-r from-brand to-brand/85 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
      <img src="${LOGO_URL}" alt="Logo" class="h-14 sm:h-16 w-auto object-contain drop-shadow" onerror="this.style.display='none'">
      <div class="flex-1 min-w-0">
        <h1 class="text-base sm:text-xl font-bold leading-tight truncate">ប្រព័ន្ធទិន្នន័យសិស្ស</h1>
        <p class="text-xs sm:text-sm text-white/80 leading-tight truncate">សាលាអន្តរទ្វីប ខូស្បេស៍</p>
      </div>
      <div class="hidden sm:flex items-center gap-2 bg-white/10 rounded-full pl-1 pr-4 py-1">
        <span class="w-8 h-8 rounded-full bg-white text-brand grid place-items-center font-bold text-sm">${esc([...me.name][0] || '?')}</span>
        <span class="text-sm">${esc(me.name)}${isAdmin() ? ' · អ្នកគ្រប់គ្រង' : ''}</span>
      </div>
      <button id="out" class="bg-white/15 hover:bg-white/25 border border-white/30 rounded-full px-4 py-1.5 text-sm transition">ចាកចេញ</button>
    </div>
  </header>

  <nav class="bg-white border-b border-slate-200 sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 py-2 flex gap-2">
      <button id="tab-quarterly" class="px-5 py-2 rounded-full text-sm font-semibold transition ${q ? C.tabActive : C.tabInactive}">ប្រចាំត្រីមាស</button>
      <button id="tab-monthly" class="px-5 py-2 rounded-full text-sm font-semibold transition ${!q ? C.tabActive : C.tabInactive}">ប្រចាំខែ</button>
    </div>
  </nav>

  <main class="max-w-7xl mx-auto my-4 sm:my-6 px-3 sm:px-4">
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
      ${stat('សិស្សប្រចាំត្រីមាស', students.length, 'bg-brand')}
      ${stat('សិស្សប្រចាំខែ', monthlyStudents.length, 'bg-accent')}
      ${isAdmin() ? stat('គ្រូ', myTeachers().length, 'bg-emerald-500') : stat('ចំណាត់ថ្នាក់ ៥', shown().filter(s => s.class_no === '៥').length, 'bg-rose-500')}
    </div>
    <h2 class="font-bold text-brand text-base sm:text-lg mt-2 mb-3 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>បន្ថែមសិស្ស ${label}</h2>
    <form id="af" class="${C.form}">
      ${isAdmin() ? `<select id="a_t" required class="${C.input}"><option value="">ជ្រើសរើសគ្រូ</option>${tOpts()}</select>` : ''}
      <input id="a_n" placeholder="ឈ្មោះសិស្ស" required class="${C.input}">
      <select id="a_c" required class="${C.input}"><option value="">ជ្រើសរើសចំណាត់ថ្នាក់</option>${CLASS_RANKS.map(r => `<option value="${r}">${r}</option>`).join('')}</select>
      ${q ? `
        <select id="a_g" class="${C.input}"><option>ស្រី</option><option>ប្រុស</option></select>
        <input id="a_d" type="date" aria-label="ថ្ងៃខែឆ្នាំកំណើត" class="${C.input}">
        <input id="a_o" list="cl" placeholder="វគ្គសិក្សា" class="${C.input}">
        <datalist id="cl">${COURSES.map(c => `<option value="${esc(c)}">`).join('')}</datalist>` : ''}
      ${!isAdmin() ? `<input id="a_tn" placeholder="ឈ្មោះគ្រូ" value="${esc(me.name)}" class="${C.input}">` : ''}
      <button class="${C.btnAccent} sm:col-span-2 lg:col-span-3">បន្ថែមសិស្ស</button>
    </form>

    <div class="flex flex-wrap items-center gap-2 mt-6 mb-3">
      <h2 class="font-bold text-brand text-base sm:text-lg flex-1 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>បញ្ជីសិស្ស ${label} (${rows.length})</h2>
      ${isAdmin() ? `<select id="flt" class="${C.input} max-w-xs"><option value="">គ្រូទាំងអស់</option>${tOpts(filter)}</select>` : ''}
      <button id="csv" class="${C.ghost}">ទាញយក Excel</button>
      <button type="button" id="imp" class="${C.ghost}">នាំចូលពី Excel (ចំណាត់ថ្នាក់ ៥)</button>
      <input type="file" id="xl" accept=".xlsx,.xls,.csv" class="hidden">
    </div>

    ${selS.size ? `<div class="flex flex-wrap items-center gap-3 mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200">
      <span class="text-sm font-semibold text-accent">បានជ្រើស ${khNum(selS.size)} នាក់</span><span class="flex-1"></span>
      <button id="bulkDel" class="${C.btnAccent}">លុបដែលបានជ្រើស</button><button id="bulkClr" class="${C.cancel}">បោះបង់ការជ្រើស</button></div>` : ''}
    <div class="${C.card} overflow-hidden">
      ${rows.length ? `<div class="overflow-x-auto"><table class="w-full border-collapse responsive-table">
        <thead><tr><th class="${C.th} w-10"><input type="checkbox" id="selAll" class="w-4 h-4 accent-brand" ${rows.length && rows.every(x => selS.has(String(x.id))) ? 'checked' : ''}></th>${heads().map(h => `<th class="${C.th}">${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((s, i) => String(editingId) === String(s.id) ? editRow(s, i) : viewRow(s, i, i > 0 && rows[i - 1].teacher_id !== s.teacher_id)).join('')}</tbody>
      </table></div>` : `<div class="p-12 text-center"><div class="text-4xl mb-2">📋</div><p class="text-slate-500">មិនទាន់មានសិស្សទេ។ បំពេញទម្រង់ខាងលើដើម្បីបន្ថែមសិស្សដំបូង។</p></div>`}
    </div>
    ${isAdmin() ? adminPanel() : ''}
  </main>`;

  const $ = id => document.getElementById(id);
  const sel = s => document.querySelectorAll(s);
  $('tab-quarterly').onclick = () => { activeTab = 'quarterly'; editingId = null; selS.clear(); render(); };
  $('tab-monthly').onclick = () => { activeTab = 'monthly'; editingId = null; selS.clear(); render(); };
  $('out').onclick = async () => { stopRealtime(); me = null; await sb.auth.signOut(); showLogin(); };
  $('af').onsubmit = addStudent;
  $('csv').onclick = exportExcel;
  $('imp').onclick = () => $('xl').click();
  $('xl').onchange = importExcel;
  if ($('flt')) $('flt').onchange = e => { filter = e.target.value; selS.clear(); render(); };

  sel('button[data-edit]').forEach(b => b.onclick = () => { editingId = b.dataset.edit; render(); });
  sel('button[data-cancel]').forEach(b => b.onclick = () => { editingId = null; render(); });
  sel('button[data-save]').forEach(b => b.onclick = () => saveEdit(b.dataset.save));
  sel('button[data-id]').forEach(b => b.onclick = async () => {
    if (!confirm('លុបសិស្សនេះ?')) return;
    const { error } = await sb.from(isQ() ? 'students' : 'monthly_students').delete().eq('id', b.dataset.id);
    if (error) return alert(error.message);
    await load(); render();
  });
  sel('input[data-sel]').forEach(c => c.onchange = () => { c.checked ? selS.add(c.dataset.sel) : selS.delete(c.dataset.sel); rerender(); });
  if ($('selAll')) $('selAll').onchange = e => { shown().forEach(x => e.target.checked ? selS.add(String(x.id)) : selS.delete(String(x.id))); rerender(); };
  if ($('bulkClr')) $('bulkClr').onclick = () => { selS.clear(); rerender(); };
  if ($('bulkDel')) $('bulkDel').onclick = async () => {
    if (!confirm(`លុបសិស្ស ${selS.size} នាក់ដែលបានជ្រើស?`)) return;
    const { error } = await sb.from(isQ() ? 'students' : 'monthly_students').delete().in('id', [...selS]);
    if (error) return alert(error.message);
    selS.clear(); await load(); render();
  };
  if (isAdmin()) bindAdmin();
}

// ---------- Auto reload (Realtime + ពិនិត្យរាល់ ៦០ វិនាទី) ----------
let rtChannel = null, rtTimer = null, rtPoll = null;
// កុំ reload ពេលកំពុងកែ ឬកំពុងវាយក្នុងទម្រង់ ដើម្បីកុំឲ្យបាត់អ្វីដែលបានវាយ
const formBusy = () => editingId != null || ['a_n', 'a_o', 't_n', 't_e', 't_p'].some(id => (document.getElementById(id)?.value || '').trim());

async function refresh() {
  if (!me || formBusy()) return;
  await load();
  render();
}

function startRealtime() {
  if (rtChannel) return;
  const schedule = () => { clearTimeout(rtTimer); rtTimer = setTimeout(refresh, 600); };
  rtChannel = sb.channel('school-data');
  ['students', 'monthly_students', 'profiles'].forEach(table =>
    rtChannel.on('postgres_changes', { event: '*', schema: 'public', table }, schedule));
  rtChannel.subscribe();
  rtPoll = setInterval(refresh, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
}

function stopRealtime() {
  if (rtChannel) sb.removeChannel(rtChannel);
  clearInterval(rtPoll); clearTimeout(rtTimer);
  rtChannel = rtPoll = rtTimer = null;
}

// ---------- បន្ថែម / កែ ----------
async function addStudent(e) {
  e.preventDefault();
  const tn = document.getElementById('a_tn');
  if (!isAdmin() && tn && tn.value.trim() && tn.value.trim() !== me.name) {
    const newName = tn.value.trim();
    const { error } = await sb.from('profiles').update({ name: newName }).eq('id', me.id);
    if (error) return alert('មិនអាចធ្វើបច្ចុប្បន្នភាពឈ្មោះគ្រូបានទេ: ' + error.message);
    me.name = newName;
  }
  const row = { teacher_id: isAdmin() ? a_t.value : me.id, name: a_n.value.trim(), class_no: a_c.value };
  if (isQ()) Object.assign(row, { gender: a_g.value, dob: a_d.value || null, course: a_o.value.trim() });
  const { error } = await sb.from(isQ() ? 'students' : 'monthly_students').insert(row);
  if (error) return alert(error.message);
  await load(); render();
}

async function saveEdit(id) {
  const v = k => document.getElementById(`e_${k}_${id}`);
  const row = { name: v('n').value.trim(), class_no: v('c').value };
  if (isQ()) Object.assign(row, { gender: v('g').value, dob: v('d').value || null, course: v('o').value.trim() });
  if (isAdmin()) row.teacher_id = v('t').value;
  const { error } = await sb.from(isQ() ? 'students' : 'monthly_students').update(row).eq('id', id);
  if (error) return alert('មិនអាចរក្សាទុកបានទេ: ' + error.message);
  editingId = null;
  await load(); render();
}

// ---------- ទាញយក Excel (.xlsx) ----------
function exportExcel() {
  if (typeof XLSX === 'undefined') return alert('មិនទាន់ដាក់ script របស់ XLSX ក្នុង index.html ទេ');
  const rows = shown();
  const head = heads().slice(0, -1);
  const data = rows.map((s, i) => isQ()
    ? [i + 1, s.name, s.gender, s.class_no, formatKhmerDate(s.dob), s.course, tname(s.teacher_id)]
    : [i + 1, s.name, s.class_no, tname(s.teacher_id)]);
  const ws = XLSX.utils.aoa_to_sheet([head, ...data]);
  ws['!cols'] = head.map((h, c) => ({ wch: Math.min(45, Math.max(String(h).length, ...data.map(r => String(r[c] ?? '').length)) + 2) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, isQ() ? 'ប្រចាំត្រីមាស' : 'ប្រចាំខែ');
  XLSX.writeFile(wb, (isQ() ? 'quarterly-' : 'monthly-') + new Date().toISOString().slice(0, 10) + '.xlsx');
}

// ---------- នាំចូលពី Excel (យកតែចំណាត់ថ្នាក់ ៥) ----------
const iso = (y, m, d) => {
  y = +y; m = +m; d = +d;
  return (!y || m < 1 || m > 12 || d < 1 || d > 31) ? null : `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

function parseDob(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) ? null : new Date(v.getTime() + 12 * 3600e3).toISOString().slice(0, 10);
  if (typeof v === 'number') { const p = XLSX.SSF.parse_date_code(v); return p ? iso(p.y, p.m, p.d) : null; }
  const s = toAscii(v).trim(), nums = s.match(/\d+/g) || [], mi = KH_MONTHS.findIndex(m => s.includes(m));
  if (mi >= 0 && nums.length >= 2) return iso(nums[nums.length - 1], mi + 1, nums[0]);
  if (nums.length >= 3) return nums[0].length === 4 ? iso(nums[0], nums[1], nums[2]) : iso(nums[2], nums[1], nums[0]);
  return null;
}

async function importExcel(e) {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (typeof XLSX === 'undefined') return alert('មិនទាន់ដាក់ script របស់ XLSX ក្នុង index.html ទេ');
  const q = isQ();
  try {
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
    const hi = rows.findIndex(r => r.some(c => norm(c).includes('ឈ្មោះ')) && r.some(c => norm(c).includes('ចំណាត់')));
    if (hi < 0) return alert('រកមិនឃើញជួរក្បាលតារាង (ឈ្មោះ, ចំណាត់ថ្នាក់) ក្នុងឯកសារនេះទេ');
    const H = rows[hi].map(norm), col = f => H.findIndex(f);
    const cName = col(h => h.includes('ឈ្មោះ') && !h.includes('គ្រូ')), cTeacher = col(h => h.includes('ឈ្មោះគ្រូ')),
      cRank = col(h => h.includes('ចំណាត់')), cGender = col(h => h.includes('ភេទ')),
      cDob = col(h => h.includes('កំណើត')), cCourse = col(h => h.includes('វគ្គ'));
    if (isAdmin() && cTeacher < 0) return alert('ឯកសារនេះគ្មានជួរ "ឈ្មោះគ្រូ" ទេ អ្នកគ្រប់គ្រងត្រូវការជួរនេះ');

    const tmap = new Map(myTeachers().map(t => [norm(t.name), t.id]));
    const existing = new Set((q ? students : monthlyStudents).map(s => s.teacher_id + '|' + norm(s.name)));
    const toAdd = [], unmatched = new Set();
    let otherRank = 0, duplicate = 0;

    for (const r of rows.slice(hi + 1)) {
      const name = String(r[cName] ?? '').trim();
      if (!name) continue;
      if (toKh(r[cRank]) !== IMPORT_RANK) { otherRank++; continue; }
      const tid = isAdmin() ? tmap.get(norm(r[cTeacher])) : me.id;
      if (!tid) { unmatched.add(String(r[cTeacher] ?? '').trim() || '(គ្មានឈ្មោះគ្រូ)'); continue; }
      const key = tid + '|' + norm(name);
      if (existing.has(key)) { duplicate++; continue; }
      existing.add(key);
      const row = { teacher_id: tid, name, class_no: IMPORT_RANK };
      if (q) {
        row.gender = cGender >= 0 ? String(r[cGender] ?? '').trim() : '';
        row.dob = cDob >= 0 ? parseDob(r[cDob]) : null;
        row.course = cCourse >= 0 ? String(r[cCourse] ?? '').trim() : '';
      }
      toAdd.push(row);
    }

    const summary = `ចំណាត់ថ្នាក់ផ្សេង (រំលង): ${otherRank}\nស្ទួន (រំលង): ${duplicate}` + (unmatched.size ? `\nរកមិនឃើញគ្រូ (រំលង): ${[...unmatched].join(', ')}` : '');
    if (!toAdd.length) return alert('គ្មានសិស្សថ្មីត្រូវនាំចូលទេ។\n' + summary);
    if (!confirm(`រកឃើញសិស្សចំណាត់ថ្នាក់ ៥ ថ្មីចំនួន ${toAdd.length} នាក់។ នាំចូល?`)) return;

    const table = q ? 'students' : 'monthly_students';
    for (let i = 0; i < toAdd.length; i += 200) {
      const { error } = await sb.from(table).insert(toAdd.slice(i, i + 200));
      if (error) return alert('នាំចូលមិនបានទេ: ' + error.message);
    }
    await load(); render();
    alert(`នាំចូលបាន ${toAdd.length} នាក់\n` + summary);
  } catch (err) {
    console.error(err);
    alert('មិនអាចអានឯកសារបានទេ: ' + err.message);
  }
}

// ---------- គ្រប់គ្រងគ្រូ (admin) ----------
function adminPanel() {
  return `
  <h2 class="font-bold text-brand text-base sm:text-lg mt-8 mb-3 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>គ្រប់គ្រងគ្រូរបស់ខ្ញុំ</h2>
  <form id="tf" class="${C.form}">
    <input id="t_n" placeholder="ឈ្មោះគ្រូ" required class="${C.input}">
    <input id="t_e" type="email" placeholder="អ៊ីមែល" required class="${C.input}">
    <input id="t_p" minlength="6" placeholder="ពាក្យសម្ងាត់ (យ៉ាងតិច ៦)" required class="${C.input}">
    <button class="${C.btnAccent} sm:col-span-2 lg:col-span-3">បន្ថែមគ្រូ</button>
  </form>
  <div class="flex flex-wrap items-center gap-3 mt-3 mb-2 px-1">
    <label class="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" id="selAllT" class="w-4 h-4 accent-brand" ${myTeachers().length && myTeachers().every(t => selT.has(t.id)) ? 'checked' : ''}> ជ្រើសគ្រូទាំងអស់</label>
    ${selT.size ? `<span class="text-sm font-semibold text-accent">បានជ្រើស ${khNum(selT.size)} នាក់</span><span class="flex-1"></span>
      <button id="bulkDelT" class="${C.btnAccent}">លុបគ្រូដែលបានជ្រើស</button><button id="bulkClrT" class="${C.cancel}">បោះបង់ការជ្រើស</button>` : ''}
  </div>
  <div class="${C.card} overflow-x-auto"><table class="w-full"><tbody>${myTeachers().map(t => `
    <tr class="hover:bg-slate-50">
      <td class="${C.td} w-10"><input type="checkbox" class="w-4 h-4 accent-brand" data-selt="${t.id}" ${selT.has(t.id) ? 'checked' : ''}></td>
      <td class="${C.td} font-medium">${esc(t.name)}</td>
      <td class="${C.td}"><span class="text-xs px-2 py-0.5 rounded bg-blue-100 text-brand">គ្រូ</span></td>
      <td class="${C.td} text-right"><button class="${C.del}" data-t="${t.id}">លុប</button></td>
    </tr>`).join('')}</tbody></table></div>`;
}

function bindAdmin() {
  tf.onsubmit = async e => {
    e.preventDefault();
    const { error } = await sb.rpc('admin_create_teacher', { p_email: t_e.value.trim(), p_password: t_p.value, p_name: t_n.value.trim() });
    if (error) return alert('មិនអាចបង្កើតគ្រូបានទេ: ' + error.message);
    await load(); render();
  };
  const g = id => document.getElementById(id);
  document.querySelectorAll('input[data-selt]').forEach(c => c.onchange = () => { c.checked ? selT.add(c.dataset.selt) : selT.delete(c.dataset.selt); rerender(); });
  if (g('selAllT')) g('selAllT').onchange = e => { myTeachers().forEach(t => e.target.checked ? selT.add(t.id) : selT.delete(t.id)); rerender(); };
  if (g('bulkClrT')) g('bulkClrT').onclick = () => { selT.clear(); rerender(); };
  if (g('bulkDelT')) g('bulkDelT').onclick = async () => {
    if (!confirm(`លុបគ្រូ ${selT.size} នាក់ រួមទាំងទិន្នន័យសិស្សរបស់ពួកគាត់ទាំងអស់?`)) return;
    const ids = [...selT], failed = [];
    for (const id of ids) {
      const name = tname(id);
      const { error } = await sb.rpc('admin_delete_teacher', { p_id: id });
      if (error) failed.push(name + ': ' + error.message);
    }
    if (ids.includes(filter)) filter = '';
    selT.clear(); await load(); render();
    if (failed.length) alert('លុបមិនបានមួយចំនួន:\n' + failed.join('\n'));
  };
  document.querySelectorAll('button[data-t]').forEach(b => b.onclick = async () => {
    if (!confirm('លុបគ្រូនេះ រួមទាំងទិន្នន័យសិស្សរបស់គាត់ទាំងអស់?')) return;
    const { error } = await sb.rpc('admin_delete_teacher', { p_id: b.dataset.t });
    if (error) return alert(error.message);
    if (filter === b.dataset.t) filter = '';
    await load(); render();
  });
}

init();