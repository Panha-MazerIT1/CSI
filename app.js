// ===== ដាក់ព័ត៌មាន Supabase របស់អ្នកនៅទីនេះ =====
const SUPABASE_URL = "https://fyrofappoidfaogzhdlm.supabase.co";
const SUPABASE_KEY = "sb_publishable_dc-70zNaPuGJHsuolZvfEw_CjiUJ8ku";
// ===============================================
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const COURSES = [
  "We start English for Beginner Level 1",
  "English Standard for practice Level 2",
  "English Standard for practice Level 3",
  "Effective English Practice and Pronunciation Level 4"
];

// បញ្ជីចំណាត់ថ្នាក់ (លេខ ១ ដល់ ៥)
const CLASS_RANKS = ['១', '២', '៣', '៤', '៥'];

// Tailwind class shortcuts
const C = {
  input: 'border border-stone-300 rounded-md px-3 py-2 bg-white min-w-0',
  btn: 'bg-brand text-white rounded-md px-4 py-2 hover:opacity-90',
  ghost: 'bg-white text-brand border border-brand rounded-md px-4 py-2 hover:bg-emerald-50',
  del: 'bg-white text-red-700 border border-red-700 rounded-md px-3 py-1 hover:bg-red-50',
  card: 'bg-white border border-stone-300 rounded-lg',
  form: 'grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2 p-4 bg-white border border-stone-300 rounded-lg',
  th: 'bg-brand text-white text-left px-3 py-2',
  td: 'px-3 py-2 border-t border-stone-200'
};

// Function បំប្លែងថ្ងៃខែឆ្នាំជាភាសាខ្មែរ (ទម្រង់ខ្លី)
// ឧទាហរណ៍៖ '2025-04-12' → '១២ មេសា ២០២៥'
function formatKhmerDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];

  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (num) => {
    return num.toString().split('').map(d => khmerNumbers[parseInt(d)]).join('');
  };

  return `${toKhmerNum(day)} ${khmerMonths[month]} ${toKhmerNum(year)}`;
}

let me, teachers = [], students = [], filter = '';

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
  <form id="lf" class="max-w-sm mx-auto mt-[12vh] grid gap-3 p-6 ${C.card}">
    <h1 class="text-xl font-semibold">ចូលប្រើប្រាស់</h1>
    <input id="em" type="email" placeholder="អ៊ីមែល" required class="${C.input}">
    <input id="pw" type="password" placeholder="ពាក្យសម្ងាត់" required class="${C.input}">
    <button class="${C.btn}">ចូល</button>
    <p id="lm" class="text-red-700 min-h-[1.2em]">${esc(err)}</p>
  </form>`;
  document.getElementById('lf').onsubmit = async e => {
    e.preventDefault();
    const { error } = await sb.auth.signInWithPassword({ email: em.value, password: pw.value });
    if (error) lm.textContent = 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ';
    else init();
  };
}

async function load() {
  teachers = (await sb.from('profiles').select('*').order('name')).data || [];
  students = (await sb.from('students').select('*').order('id')).data || [];
}

const tname = id => (teachers.find(t => t.id === id) || {}).name || '';
const isAdmin = () => me.role === 'admin';
const shown = () => students.filter(s => !filter || s.teacher_id === filter);

function render() {
  const rows = shown();
  $app.innerHTML = `
  <header class="bg-brand text-white px-5 py-3 flex flex-wrap items-center gap-3">
    <h1 class="flex-1 text-lg font-semibold">ប្រព័ន្ធទិន្នន័យសិស្ស</h1>
    <span>${esc(me.name)}${isAdmin() ? ' (អ្នកគ្រប់គ្រង)' : ''}</span>
    <button id="out" class="bg-white text-brand rounded-md px-3 py-1">ចាកចេញ</button>
  </header>
  <main class="max-w-6xl mx-auto my-5 px-4">
    <h2 class="font-semibold mt-6 mb-2">បន្ថែមសិស្ស</h2>
    <form id="af" class="${C.form}">
      ${isAdmin() ? `<select id="a_t" required class="${C.input}"><option value="">ជ្រើសរើសគ្រូ</option>${teachers.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select>` : ''}
      <input id="a_n" placeholder="ឈ្មោះសិស្ស" required class="${C.input}">
      <select id="a_g" class="${C.input}"><option>ស្រី</option><option>ប្រុស</option></select>
      
      <select id="a_c" class="${C.input}">
        <option value="">ជ្រើសរើសចំណាត់ថ្នាក់</option>
        ${CLASS_RANKS.map(r => `<option value="${r}">${r}</option>`).join('')}
      </select>
      
      <input id="a_d" type="date" aria-label="ថ្ងៃខែឆ្នាំកំណើត" class="${C.input}">
      <input id="a_o" list="cl" placeholder="វគ្គសិក្សា" class="${C.input}">
      <datalist id="cl">${COURSES.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
      
      ${!isAdmin() ? `<input id="a_tn" placeholder="ឈ្មោះគ្រូ" value="${esc(me.name)}" class="${C.input}">` : ''}
      
      <button class="${C.btn}">បន្ថែម</button>
    </form>

    <div class="flex flex-wrap items-center gap-2 mt-6 mb-3">
      <h2 class="font-semibold flex-1">បញ្ជីសិស្ស (${rows.length})</h2>
      ${isAdmin() ? `<select id="flt" class="${C.input}"><option value="">គ្រូទាំងអស់</option>${teachers.map(t => `<option value="${t.id}" ${t.id === filter ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>` : ''}
      <button id="csv" class="${C.ghost}">ទាញយកសម្រាប់ Google Sheet (CSV)</button>
    </div>

    <div class="${C.card} overflow-x-auto">
      ${rows.length ? `
      <table class="w-full border-collapse">
        <thead><tr>
          <th class="${C.th}">ល.រ</th><th class="${C.th}">ឈ្មោះ</th><th class="${C.th}">ភេទ</th><th class="${C.th}">ចំណាត់ថ្នាក់</th>
          <th class="${C.th}">ថ្ងៃខែឆ្នាំកំណើត</th><th class="${C.th}">វគ្គសិក្សា</th><th class="${C.th}">ឈ្មោះគ្រូ</th><th class="${C.th}"></th>
        </tr></thead>
        <tbody>${rows.map((s, i) => `
          <tr>
            <td class="${C.td}">${i + 1}</td><td class="${C.td}">${esc(s.name)}</td><td class="${C.td}">${esc(s.gender)}</td>
            <td class="${C.td}">${esc(s.class_no)}</td>
            <td class="${C.td}">${esc(formatKhmerDate(s.dob))}</td>
            <td class="${C.td}">${esc(s.course)}</td>
            <td class="${C.td}">${esc(tname(s.teacher_id))}</td>
            <td class="${C.td}"><button class="${C.del}" data-id="${s.id}">លុប</button></td>
          </tr>`).join('')}
        </tbody>
      </table>` : `<p class="p-8 text-center text-stone-500">មិនទាន់មានសិស្សទេ។ បំពេញទម្រង់ខាងលើដើម្បីបន្ថែមសិស្សដំបូង។</p>`}
    </div>
    ${isAdmin() ? adminPanel() : ''}
  </main>`;

  out.onclick = async () => { await sb.auth.signOut(); showLogin(); };
  af.onsubmit = addStudent;
  csv.onclick = exportCsv;
  if (window.flt) flt.onchange = () => { filter = flt.value; render(); };
  document.querySelectorAll('button[data-id]').forEach(b => b.onclick = async () => {
    if (!confirm('លុបសិស្សនេះ?')) return;
    const { error } = await sb.from('students').delete().eq('id', b.dataset.id);
    if (error) return alert(error.message);
    await load(); render();
  });
  if (isAdmin()) bindAdmin();
}

async function addStudent(e) {
  e.preventDefault();
  
  // ✅ ប្រសិនបើគ្រូធម្មតាបំពេញឈ្មោះខុសពី Profile សូម Update Profile ជាមុនសិន
  if (!isAdmin() && a_tn && a_tn.value.trim() && a_tn.value.trim() !== me.name) {
    const newName = a_tn.value.trim();
    
    // ✅ Update ឈ្មោះទៅ Supabase
    const { data: updated, error: updateErr } = await sb
      .from('profiles')
      .update({ name: newName })
      .eq('id', me.id)
      .select()
      .single();
    
    // ✅ ពិនិត្យ Error ឱ្យបានត្រឹមត្រូវ
    if (updateErr) {
      alert('មិនអាចធ្វើបច្ចុប្បន្នភាពឈ្មោះគ្រូបានទេ: ' + updateErr.message);
      return;
    }
    
    // ✅ Update ឈ្មោះក្នុង memory ផងដែរ
    me.name = newName;
    
    // ✅ Update ក្នុង Array teachers ផងដែរ
    const teacherIndex = teachers.findIndex(t => t.id === me.id);
    if (teacherIndex !== -1) {
      teachers[teacherIndex].name = newName;
    }
  }
  
  const row = {
    teacher_id: isAdmin() ? a_t.value : me.id,
    name: a_n.value.trim(), 
    gender: a_g.value, 
    class_no: a_c.value.trim(),
    dob: a_d.value || null, 
    course: a_o.value.trim()
  };
  
  const { error } = await sb.from('students').insert(row);
  if (error) return alert(error.message);
  
  await load(); 
  render(); // ✅ Render ឡើងវិញដើម្បីបង្ហាញឈ្មោះថ្មីនៅ Header
}

function exportCsv() {
  const head = ['ល.រ', 'ឈ្មោះ', 'ភេទ', 'ចំណាត់ថ្នាក់', 'ថ្ងៃខែឆ្នាំកំណើត', 'វគ្គសិក្សា', 'ឈ្មោះគ្រូ'];
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const lines = [head, ...shown().map((s, i) => [
    i + 1, 
    s.name, 
    s.gender, 
    s.class_no, 
    formatKhmerDate(s.dob),
    s.course, 
    tname(s.teacher_id)
  ])].map(r => r.map(q).join(','));
  
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'students-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
}

function adminPanel() {
  return `
  <h2 class="font-semibold mt-8 mb-2">គ្រប់គ្រងគ្រូ</h2>
  <form id="tf" class="${C.form}">
    <input id="t_n" placeholder="ឈ្មោះគ្រូ" required class="${C.input}">
    <input id="t_e" type="email" placeholder="អ៊ីមែល" required class="${C.input}">
    <input id="t_p" minlength="6" placeholder="ពាក្យសម្ងាត់ (យ៉ាងតិច ៦)" required class="${C.input}">
    <button class="${C.btn}">បន្ថែមគ្រូ</button>
  </form>
  <div class="${C.card} overflow-x-auto mt-3">
    <table class="w-full"><tbody>${teachers.map(t => `
      <tr>
        <td class="${C.td}">${esc(t.name)}</td>
        <td class="${C.td}">${t.role === 'admin' ? 'អ្នកគ្រប់គ្រង' : 'គ្រូ'}</td>
        <td class="${C.td} text-right">${t.id === me.id ? '' : `<button class="${C.del}" data-t="${t.id}">លុបគ្រូ</button>`}</td>
      </tr>`).join('')}
    </tbody></table>
  </div>`;
}

function bindAdmin() {
  tf.onsubmit = async e => {
    e.preventDefault();
    const tmp = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, storageKey: 'tmp-signup' }
    });
    const { data, error } = await tmp.auth.signUp({ 
      email: t_e.value, 
      password: t_p.value,
      options: {
        data: {
          name: t_n.value.trim()
        }
      }
    });
    if (error || !data.user) return alert(error ? error.message : 'មិនអាចបង្កើតគណនីបានទេ');
    const r = await sb.from('profiles').insert({ 
      id: data.user.id, 
      name: t_n.value.trim(), 
      role: 'teacher' 
    });
    if (r.error) return alert(r.error.message);
    await load(); render();
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