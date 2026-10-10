// ===== ដាក់ព័ត៌មាន Supabase របស់អ្នកនៅទីនេះ =====
const SUPABASE_URL = "https://fyrofappoidfaogzhdlm.supabase.co";
const SUPABASE_KEY = "sb_publishable_dc-70zNaPuGJHsuolZvfEw_CjiUJ8ku";

const LOGO_URL = 'https://fyrofappoidfaogzhdlm.supabase.co/storage/v1/object/sign/logo/New%20Tyn%20Logo%20-%20New.png?token=eyJraWQiOiIwZDhiMjI2Yi1hZDU3LTRkZTEtOGM1OS02YTFjNjY4NzkzNTgiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJsb2dvL05ldyBUeW4gTG9nbyAtIE5ldy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkxNjE1NjY1LCJleHAiOjE4MjMxNTE2NjV9.8qEkk5pKOO0siU7h7p8sp22LhTOinerfqDq027lJLxqhEDup_Qv9Ct8FkFPa1aiU2RsU7gU_fKPQdkc0BVONQw';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const COURSES = [
  "We start English for Beginner Level 1",
  "English Standard for practice Level 2",
  "English Standard for practice Level 3",
  "Effective English Practice and Pronunciation Level 4"
];

const CLASS_RANKS = ['១', '២', '៣', '៤', '៥'];

// ============================================================
// ✅ Collator សម្រាប់អក្ខរក្រមខ្មែរ
// ============================================================
const khmerCollator = new Intl.Collator('km-KH', { sensitivity: 'base', numeric: true });
function sortByKhmerName(a, b) {
  return khmerCollator.compare(a.name || '', b.name || '');
}

// ============================================================
// ✅ Tailwind Class Shortcuts
// ============================================================
const C = {
  input: 'w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition text-sm',
  btn: 'bg-brand text-white rounded-lg px-4 py-2.5 hover:bg-blue-900 active:scale-95 transition font-medium text-sm shadow-sm',
  btnAccent: 'bg-accent text-white rounded-lg px-4 py-2.5 hover:bg-red-700 active:scale-95 transition font-medium text-sm shadow-sm',
  ghost: 'bg-white text-brand border-2 border-brand rounded-lg px-4 py-2.5 hover:bg-blue-50 active:scale-95 transition font-medium text-sm',
  edit: 'bg-blue-50 text-brand border border-brand rounded-md px-3 py-1.5 hover:bg-blue-100 transition text-xs font-medium',
  del: 'bg-red-50 text-accent border border-accent rounded-md px-3 py-1.5 hover:bg-red-100 transition text-xs font-medium',
  save: 'bg-emerald-600 text-white rounded-md px-3 py-1.5 hover:bg-emerald-700 transition text-xs font-medium',
  cancel: 'bg-slate-200 text-slate-700 rounded-md px-3 py-1.5 hover:bg-slate-300 transition text-xs font-medium',
  card: 'bg-white border border-slate-200 rounded-xl shadow-sm',
  form: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm',
  th: 'bg-brand text-white text-left px-3 py-3 text-sm font-semibold',
  td: 'px-3 py-3 border-t border-slate-100 text-sm',
  editRow: 'bg-yellow-50',
  tabActive: 'border-b-4 border-brand text-brand font-bold',
  tabInactive: 'border-b-4 border-transparent text-slate-500 hover:text-brand'
};

// ============================================================
// ✅ បំប្លែងថ្ងៃខែឆ្នាំជាភាសាខ្មែរ (ទម្រង់៖ ១២-មេសា-២០១០)
// ============================================================
function formatKhmerDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (num) => num.toString().split('').map(d => khmerNumbers[parseInt(d)]).join('');
  return `${toKhmerNum(day)}-${khmerMonths[month]}-${toKhmerNum(year)}`;
}

let me, teachers = [], students = [], monthlyStudents = [], filter = '', activeTab = 'quarterly';
let editingId = null;

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
}

function showLogin(err = '') {
  $app.innerHTML = `
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-slate-100">
    <form id="lf" class="w-full max-w-md grid gap-4 p-6 sm:p-8 ${C.card}">
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
    if (error) lm.textContent = 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ';
    else init();
  };
}

// ============================================================
// ✅ Load — ទាញយកតែទិន្នន័យរបស់ខ្លួនឯង
// ============================================================
async function load() {
  // ✅ ទាញយក "ខ្លួនឯង" និង "គ្រូរបស់ខ្លួន"
  const { data: t, error: errT } = await sb.from('profiles')
    .select('*')
    .or(`id.eq.${me.id},parent_admin_id.eq.${me.id}`);
  
  if (errT) {
    console.error('❌ Error loading teachers:', errT);
    alert('មិនអាចទាញយកគ្រូបានទេ: ' + errT.message);
  }
  
  teachers = (t || []).sort(sortByKhmerName);
  console.log('✅ Loaded teachers:', teachers.length, teachers);
  
  const teacherIds = teachers.map(t => t.id);
  if (teacherIds.length > 0) {
    // ✅ ទាញយកសិស្សប្រចាំត្រីមាស
    const { data: s } = await sb.from('students').select('*').in('teacher_id', teacherIds);
    students = (s || []).sort((a, b) => {
      const tA = teachers.find(t => t.id === a.teacher_id);
      const tB = teachers.find(t => t.id === b.teacher_id);
      const cmp = khmerCollator.compare(tA?.name || '', tB?.name || '');
      if (cmp !== 0) return cmp;
      return khmerCollator.compare(a.name || '', b.name || '');
    });
    
    // ✅ ទាញយកសិស្សប្រចាំខែ
    const { data: ms } = await sb.from('monthly_students').select('*').in('teacher_id', teacherIds);
    monthlyStudents = (ms || []).sort((a, b) => {
      const tA = teachers.find(t => t.id === a.teacher_id);
      const tB = teachers.find(t => t.id === b.teacher_id);
      const cmp = khmerCollator.compare(tA?.name || '', tB?.name || '');
      if (cmp !== 0) return cmp;
      return khmerCollator.compare(a.name || '', b.name || '');
    });
  } else {
    students = [];
    monthlyStudents = [];
  }
}

const tname = id => (teachers.find(t => t.id === id) || {}).name || '';
const isAdmin = () => me.role === 'admin';
const shownQuarterly = () => students.filter(s => !filter || s.teacher_id === filter);
const shownMonthly = () => monthlyStudents.filter(s => !filter || s.teacher_id === filter);

function render() {
  const rowsQ = shownQuarterly();
  const rowsM = shownMonthly();
  const isQ = activeTab === 'quarterly';
  const rows = isQ ? rowsQ : rowsM;
  
  $app.innerHTML = `
  <header class="bg-brand text-white shadow-md sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
      <img src="${LOGO_URL}" alt="Logo" class="h-20 sm:h-24 w-auto object-contain" onerror="this.style.display='none'">
      <div class="flex-1 min-w-0">
        <h1 class="text-base sm:text-xl font-bold leading-tight">ប្រព័ន្ធទិន្នន័យសិស្ស</h1>
        <p class="text-xs sm:text-sm opacity-90 leading-tight">សាលាអន្តរទ្វីប ខូស្បេស៍</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs sm:text-sm hidden sm:inline">${esc(me.name)}${isAdmin() ? ' (អ្នកគ្រប់គ្រង)' : ''}</span>
        <button id="out" class="bg-white text-brand rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-blue-50 transition">ចាកចេញ</button>
      </div>
    </div>
  </header>

  <!-- ✅ Tabs -->
  <div class="bg-white border-b border-slate-200 sticky top-[88px] sm:top-[104px] z-10">
    <div class="max-w-7xl mx-auto px-4 flex gap-6">
      <button id="tab-quarterly" class="py-3 text-sm sm:text-base ${isQ ? C.tabActive : C.tabInactive}">📅 ប្រចាំត្រីមាស</button>
      <button id="tab-monthly" class="py-3 text-sm sm:text-base ${!isQ ? C.tabActive : C.tabInactive}">🗓️ ប្រចាំខែ</button>
    </div>
  </div>

  <main class="max-w-7xl mx-auto my-4 sm:my-6 px-3 sm:px-4">
    <h2 class="font-bold text-brand text-base sm:text-lg mt-2 mb-3 flex items-center gap-2">
      <span class="w-1 h-5 bg-accent rounded"></span>
      បន្ថែមសិស្ស ${isQ ? 'ប្រចាំត្រីមាស' : 'ប្រចាំខែ'}
    </h2>
    <form id="af" class="${C.form}">
      ${isAdmin() ? `<select id="a_t" required class="${C.input}"><option value="">ជ្រើសរើសគ្រូ</option>${teachers.filter(t => t.id !== me.id).map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select>` : ''}
      <input id="a_n" placeholder="ឈ្មោះសិស្ស" required class="${C.input}">
      <select id="a_c" class="${C.input}">
        <option value="">ជ្រើសរើសចំណាត់ថ្នាក់</option>
        ${CLASS_RANKS.map(r => `<option value="${r}">${r}</option>`).join('')}
      </select>
      ${isQ ? `
        <select id="a_g" class="${C.input}"><option>ស្រី</option><option>ប្រុស</option></select>
        <input id="a_d" type="date" aria-label="ថ្ងៃខែឆ្នាំកំណើត" class="${C.input}">
        <input id="a_o" list="cl" placeholder="វគ្គសិក្សា" class="${C.input}">
        <datalist id="cl">${COURSES.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
      ` : ''}
      ${!isAdmin() ? `<input id="a_tn" placeholder="ឈ្មោះគ្រូ" value="${esc(me.name)}" class="${C.input}">` : ''}
      <button class="${C.btnAccent} sm:col-span-2 lg:col-span-3">➕ បន្ថែមសិស្ស</button>
    </form>

    <div class="flex flex-wrap items-center gap-2 mt-6 mb-3">
      <h2 class="font-bold text-brand text-base sm:text-lg flex-1 flex items-center gap-2">
        <span class="w-1 h-5 bg-accent rounded"></span>
        បញ្ជីសិស្ស ${isQ ? 'ប្រចាំត្រីមាស' : 'ប្រចាំខែ'} (${rows.length})
      </h2>
      ${isAdmin() ? `<select id="flt" class="${C.input} max-w-xs"><option value="">គ្រូទាំងអស់</option>${teachers.filter(t => t.id !== me.id).map(t => `<option value="${t.id}" ${t.id === filter ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>` : ''}
      <button id="csv" class="${C.ghost}">📥 ទាញយក CSV</button>
    </div>

    <div class="${C.card} overflow-hidden">
      ${rows.length ? `
      <div class="overflow-x-auto">
        <table class="w-full border-collapse responsive-table">
          <thead><tr>
            <th class="${C.th}">ល.រ</th>
            <th class="${C.th}">ឈ្មោះ</th>
            ${isQ ? `
              <th class="${C.th}">ភេទ</th>
              <th class="${C.th}">ចំណាត់ថ្នាក់</th>
              <th class="${C.th}">ថ្ងៃខែឆ្នាំកំណើត</th>
              <th class="${C.th}">វគ្គសិក្សា</th>
            ` : `
              <th class="${C.th}">ចំណាត់ថ្នាក់</th>
            `}
            <th class="${C.th}">ឈ្មោះគ្រូ</th>
            <th class="${C.th}">សកម្មភាព</th>
          </tr></thead>
          <tbody>${rows.map((s, i) => String(editingId) === String(s.id) ? (isQ ? editRowQ(s, i) : editRowM(s, i)) : (isQ ? viewRowQ(s, i) : viewRowM(s, i))).join('')}
          </tbody>
        </table>
      </div>` : `<p class="p-8 text-center text-slate-500">មិនទាន់មានសិស្សទេ។ បំពេញទម្រង់ខាងលើដើម្បីបន្ថែមសិស្សដំបូង។</p>`}
    </div>
    ${isAdmin() ? adminPanel() : ''}
  </main>`;

  // ✅ Tab events
  document.getElementById('tab-quarterly').onclick = () => { activeTab = 'quarterly'; editingId = null; render(); };
  document.getElementById('tab-monthly').onclick = () => { activeTab = 'monthly'; editingId = null; render(); };
  
  out.onclick = async () => { await sb.auth.signOut(); showLogin(); };
  af.onsubmit = addStudent;
  csv.onclick = exportCsv;
  if (window.flt) flt.onchange = () => { filter = flt.value; render(); };

  document.querySelectorAll('button[data-edit]').forEach(b => b.onclick = () => {
    editingId = b.dataset.edit;
    render();
  });
  document.querySelectorAll('button[data-cancel]').forEach(b => b.onclick = () => {
    editingId = null;
    render();
  });
  document.querySelectorAll('button[data-save]').forEach(b => b.onclick = () => saveEdit(b.dataset.save));
  document.querySelectorAll('button[data-id]').forEach(b => b.onclick = async () => {
    if (!confirm('លុបសិស្សនេះ?')) return;
    const table = isQ ? 'students' : 'monthly_students';
    const { error } = await sb.from(table).delete().eq('id', b.dataset.id);
    if (error) return alert(error.message);
    await load(); render();
  });
  if (isAdmin()) bindAdmin();
}

// ============ Quarterly View/Edit ============
function viewRowQ(s, i) {
  return `
    <tr class="hover:bg-slate-50 transition">
      <td class="${C.td}" data-label="ល.រ">${i + 1}</td>
      <td class="${C.td} font-medium" data-label="ឈ្មោះ">${esc(s.name)}</td>
      <td class="${C.td}" data-label="ភេទ">${esc(s.gender)}</td>
      <td class="${C.td}" data-label="ចំណាត់ថ្នាក់"><span class="inline-block bg-blue-100 text-brand px-2 py-0.5 rounded text-xs font-medium">${esc(s.class_no)}</span></td>
      <td class="${C.td}" data-label="ថ្ងៃខែឆ្នាំកំណើត">${esc(formatKhmerDate(s.dob))}</td>
      <td class="${C.td} text-slate-600 text-xs" data-label="វគ្គសិក្សា">${esc(s.course)}</td>
      <td class="${C.td} text-slate-600 text-xs" data-label="ឈ្មោះគ្រូ">${esc(tname(s.teacher_id))}</td>
      <td class="${C.td} whitespace-nowrap" data-label="សកម្មភាព">
        <button class="${C.edit}" data-edit="${s.id}">✏️ កែ</button>
        <button class="${C.del}" data-id="${s.id}">🗑️ លុប</button>
      </td>
    </tr>`;
}

function editRowQ(s, i) {
  return `
    <tr class="${C.editRow}">
      <td class="${C.td}" data-label="ល.រ">${i + 1}</td>
      <td class="${C.td}" data-label="ឈ្មោះ"><input id="e_n_${s.id}" value="${esc(s.name)}" class="${C.input}"></td>
      <td class="${C.td}" data-label="ភេទ">
        <select id="e_g_${s.id}" class="${C.input}">
          <option ${s.gender === 'ស្រី' ? 'selected' : ''}>ស្រី</option>
          <option ${s.gender === 'ប្រុស' ? 'selected' : ''}>ប្រុស</option>
        </select>
      </td>
      <td class="${C.td}" data-label="ចំណាត់ថ្នាក់">
        <select id="e_c_${s.id}" class="${C.input}">
          ${CLASS_RANKS.map(r => `<option ${s.class_no === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </td>
      <td class="${C.td}" data-label="ថ្ងៃខែឆ្នាំកំណើត"><input id="e_d_${s.id}" type="date" value="${s.dob || ''}" class="${C.input}"></td>
      <td class="${C.td}" data-label="វគ្គសិក្សា"><input id="e_o_${s.id}" value="${esc(s.course)}" class="${C.input}"></td>
      <td class="${C.td}" data-label="ឈ្មោះគ្រូ">
        ${isAdmin() ? `<select id="e_t_${s.id}" class="${C.input}">${teachers.filter(t => t.id !== me.id).map(t => `<option value="${t.id}" ${s.teacher_id === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>` : esc(tname(s.teacher_id))}
      </td>
      <td class="${C.td} whitespace-nowrap" data-label="សកម្មភាព">
        <button class="${C.save}" data-save="${s.id}">💾 រក្សាទុក</button>
        <button class="${C.cancel}" data-cancel="${s.id}">✖️ បោះបង់</button>
      </td>
    </tr>`;
}

// ============ Monthly View/Edit ============
function viewRowM(s, i) {
  return `
    <tr class="hover:bg-slate-50 transition">
      <td class="${C.td}" data-label="ល.រ">${i + 1}</td>
      <td class="${C.td} font-medium" data-label="ឈ្មោះ">${esc(s.name)}</td>
      <td class="${C.td}" data-label="ចំណាត់ថ្នាក់"><span class="inline-block bg-blue-100 text-brand px-2 py-0.5 rounded text-xs font-medium">${esc(s.class_no)}</span></td>
      <td class="${C.td} text-slate-600 text-xs" data-label="ឈ្មោះគ្រូ">${esc(tname(s.teacher_id))}</td>
      <td class="${C.td} whitespace-nowrap" data-label="សកម្មភាព">
        <button class="${C.edit}" data-edit="${s.id}">✏️ កែ</button>
        <button class="${C.del}" data-id="${s.id}">🗑️ លុប</button>
      </td>
    </tr>`;
}

function editRowM(s, i) {
  return `
    <tr class="${C.editRow}">
      <td class="${C.td}" data-label="ល.រ">${i + 1}</td>
      <td class="${C.td}" data-label="ឈ្មោះ"><input id="e_n_${s.id}" value="${esc(s.name)}" class="${C.input}"></td>
      <td class="${C.td}" data-label="ចំណាត់ថ្នាក់">
        <select id="e_c_${s.id}" class="${C.input}">
          ${CLASS_RANKS.map(r => `<option ${s.class_no === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </td>
      <td class="${C.td}" data-label="ឈ្មោះគ្រូ">
        ${isAdmin() ? `<select id="e_t_${s.id}" class="${C.input}">${teachers.filter(t => t.id !== me.id).map(t => `<option value="${t.id}" ${s.teacher_id === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>` : esc(tname(s.teacher_id))}
      </td>
      <td class="${C.td} whitespace-nowrap" data-label="សកម្មភាព">
        <button class="${C.save}" data-save="${s.id}">💾 រក្សាទុក</button>
        <button class="${C.cancel}" data-cancel="${s.id}">✖️ បោះបង់</button>
      </td>
    </tr>`;
}

async function saveEdit(id) {
  const isQ = activeTab === 'quarterly';
  
  if (isQ) {
    const row = {
      name: document.getElementById(`e_n_${id}`).value.trim(),
      gender: document.getElementById(`e_g_${id}`).value,
      class_no: document.getElementById(`e_c_${id}`).value,
      dob: document.getElementById(`e_d_${id}`).value || null,
      course: document.getElementById(`e_o_${id}`).value.trim()
    };
    if (isAdmin()) row.teacher_id = document.getElementById(`e_t_${id}`).value;
    const { error } = await sb.from('students').update(row).eq('id', id);
    if (error) return alert('មិនអាចរក្សាទុកបានទេ: ' + error.message);
  } else {
    const row = {
      name: document.getElementById(`e_n_${id}`).value.trim(),
      class_no: document.getElementById(`e_c_${id}`).value
    };
    if (isAdmin()) row.teacher_id = document.getElementById(`e_t_${id}`).value;
    const { error } = await sb.from('monthly_students').update(row).eq('id', id);
    if (error) return alert('មិនអាចរក្សាទុកបានទេ: ' + error.message);
  }
  
  editingId = null;
  await load();
  render();
}

async function addStudent(e) {
  e.preventDefault();
  const isQ = activeTab === 'quarterly';
  
  if (!isAdmin() && a_tn && a_tn.value.trim() && a_tn.value.trim() !== me.name) {
    const newName = a_tn.value.trim();
    const { error: updateErr } = await sb.from('profiles').update({ name: newName }).eq('id', me.id).select().single();
    if (updateErr) return alert('មិនអាចធ្វើបច្ចុប្បន្នភាពឈ្មោះគ្រូបានទេ: ' + updateErr.message);
    me.name = newName;
    const teacherIndex = teachers.findIndex(t => t.id === me.id);
    if (teacherIndex !== -1) teachers[teacherIndex].name = newName;
  }
  
  if (isQ) {
    const row = {
      teacher_id: isAdmin() ? a_t.value : me.id,
      name: a_n.value.trim(), gender: a_g.value, class_no: a_c.value.trim(),
      dob: a_d.value || null, course: a_o.value.trim()
    };
    const { error } = await sb.from('students').insert(row);
    if (error) return alert(error.message);
  } else {
    const row = {
      teacher_id: isAdmin() ? a_t.value : me.id,
      name: a_n.value.trim(), class_no: a_c.value.trim()
    };
    const { error } = await sb.from('monthly_students').insert(row);
    if (error) return alert(error.message);
  }
  
  await load(); render();
}

function exportCsv() {
  const isQ = activeTab === 'quarterly';
  const rows = isQ ? shownQuarterly() : shownMonthly();
  
  let head, lines;
  if (isQ) {
    head = ['ល.រ', 'ឈ្មោះ', 'ភេទ', 'ចំណាត់ថ្នាក់', 'ថ្ងៃខែឆ្នាំកំណើត', 'វគ្គសិក្សា', 'ឈ្មោះគ្រូ'];
    lines = [head, ...rows.map((s, i) => [i + 1, s.name, s.gender, s.class_no, formatKhmerDate(s.dob), s.course, tname(s.teacher_id)])];
  } else {
    head = ['ល.រ', 'ឈ្មោះ', 'ចំណាត់ថ្នាក់', 'ឈ្មោះគ្រូ'];
    lines = [head, ...rows.map((s, i) => [i + 1, s.name, s.class_no, tname(s.teacher_id)])];
  }
  
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const csv = lines.map(r => r.map(q).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (isQ ? 'quarterly-' : 'monthly-') + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
}

function adminPanel() {
  return `
  <h2 class="font-bold text-brand text-base sm:text-lg mt-8 mb-3 flex items-center gap-2">
    <span class="w-1 h-5 bg-accent rounded"></span>
    គ្រប់គ្រងគ្រូរបស់ខ្ញុំ
  </h2>
  <form id="tf" class="${C.form}">
    <input id="t_n" placeholder="ឈ្មោះគ្រូ" required class="${C.input}">
    <input id="t_e" type="email" placeholder="អ៊ីមែល" required class="${C.input}">
    <input id="t_p" minlength="6" placeholder="ពាក្យសម្ងាត់ (យ៉ាងតិច ៦)" required class="${C.input}">
    <button class="${C.btnAccent} sm:col-span-2 lg:col-span-3">➕ បន្ថែមគ្រូ</button>
  </form>
  <div class="${C.card} overflow-x-auto mt-3">
    <table class="w-full"><tbody>${teachers.filter(t => t.id !== me.id).map(t => `
      <tr class="hover:bg-slate-50">
        <td class="${C.td} font-medium">${esc(t.name)}</td>
        <td class="${C.td}"><span class="text-xs px-2 py-0.5 rounded ${t.role === 'admin' ? 'bg-red-100 text-accent' : 'bg-blue-100 text-brand'}">${t.role === 'admin' ? 'អ្នកគ្រប់គ្រង' : 'គ្រូ'}</span></td>
        <td class="${C.td} text-right">${`<button class="${C.del}" data-t="${t.id}">🗑️ លុប</button>`}</td>
      </tr>`).join('')}
    </tbody></table>
  </div>`;
}

function bindAdmin() {
  tf.onsubmit = async e => {
  e.preventDefault();
  
  // ✅ បង្កើត Client បណ្តោះអាសន្ន
  const tmp = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, storageKey: 'tmp-signup' }
  });
  
  // ✅ បង្កើត Account ក្នុង Auth
  const { data, error } = await tmp.auth.signUp({ 
    email: t_e.value, 
    password: t_p.value, 
    options: { data: { name: t_n.value.trim() } } 
  });
  
  if (error || !data.user) {
    console.error('❌ SignUp Error:', error);
    return alert(error ? error.message : 'មិនអាចបង្កើតគណនីបានទេ');
  }
  
  console.log('📝 Creating teacher:', {
    id: data.user.id,
    name: t_n.value.trim(),
    role: 'teacher',
    parent_admin_id: me.id
  });
  
  // ✅ Insert Profile ជាមួយ parent_admin_id
  const r = await sb.from('profiles').insert({ 
    id: data.user.id, 
    name: t_n.value.trim(), 
    role: 'teacher', 
    parent_admin_id: me.id 
  });
  
  if (r.error) {
    console.error('❌ Insert Error:', r.error);
    return alert('មិនអាចបង្កើតគ្រូបានទេ: ' + r.error.message);
  }
  
  console.log('✅ Teacher created successfully');
  
  // ✅ បង្ហាញភ្លាមៗដោយ Reload
  await load(); 
  render();
  
  // ✅ Clear Form
  t_n.value = '';
  t_e.value = '';
  t_p.value = '';
};
  
  document.querySelectorAll('button[data-t]').forEach(b => b.onclick = async () => {
    if (!confirm('លុបគ្រូនេះ រួមទាំងទិន្នន័យសិស្សរបស់គាត់ទាំងអស់?')) return;
    const { error } = await sb.from('profiles').delete().eq('id', b.dataset.t);
    if (error) return alert(error.message);
    if (filter === b.dataset.t) filter = '';
    await load(); render();
  });
}

init();