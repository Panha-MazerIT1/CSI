// ===== roster.js · Tab "បញ្ជីសិស្សថ្នាក់" (នៅជួរជាមួយ ប្រចាំខែ / ប្រចាំត្រីមាស) =====
// គ្រូ upload / បន្ថែម / កែ ម្តងតែមួយ រួចជ្រើសសិស្ស + ចំណាត់ថ្នាក់ → បញ្ចូលទៅប្រចាំខែ ឬប្រចាំត្រីមាស
// ដាក់ក្រោម app.js ក្នុង index.html (មិនបាច់កែ app.js) · ប្រើតារាង roster_students ដែលមានស្រាប់ក្នុង Supabase
(() => {
  const T = 'roster_students';
  const GENDER = v => { const s = String(v ?? '').trim(); return /^(ស្រី|ស|f|female)$/i.test(s) ? 'ស្រី' : /^(ប្រុស|ប|m|male)$/i.test(s) ? 'ប្រុស' : s; };
  let rows = [], selected = new Set(), ranks = {}, who = '', loadErr = '', force = false, justLoaded = false;
  const gid = id => document.getElementById(id);
  const cb = 'cb checked:bg-brand checked:border-brand';
  const EI = 'min-w-0 max-w-[62%] md:max-w-none';          // ប្រអប់កែក្នុងតារាង (ទូរស័ព្ទ / កុំព្យូទ័រ)
  const KEEP = ['rs_f_name', 'rs_f_gender', 'rs_f_village', 'rs_f_dob', 'rs_f_phone', 'rs_f_enr', 'rs_f_bus', 'rs_course'];
  const target = () => (isAdmin() ? who : me.id);
  const list = () => rows.filter(r => !who || r.teacher_id === who);
  const pickedIds = () => list().filter(r => selected.has(String(r.id))).map(r => String(r.id));
  const editRid = () => (typeof editingId === 'string' && editingId[0] === 'r') ? editingId.slice(1) : null;
  const rrender = () => { force = true; try { render(); } finally { force = false; } };

  async function loadRoster() {
    if (!me) return;
    const ids = teachers.map(t => t.id);
    if (!ids.length) { rows = []; return; }
    const { data, error } = await sb.from(T).select('*').in('teacher_id', ids);
    if (error) { loadErr = error.message; rows = []; return; }
    loadErr = '';
    rows = (data || []).sort((a, b) => tIndex(a.teacher_id) - tIndex(b.teacher_id) || a.id - b.id);
    const cur = new Set(rows.map(r => String(r.id)));
    [...selected].forEach(id => { if (!cur.has(id)) selected.delete(id); });
  }

  // ---------- Tab ក្នុងរបារ ----------
  function injectTab() {
    const nav = document.querySelector('#app nav > div');
    if (!nav) return;
    nav.classList.add('overflow-x-auto');
    let b = gid('tab-roster');
    if (!b) {
      b = document.createElement('button');
      b.id = 'tab-roster';
      b.textContent = 'បញ្ជីសិស្សថ្នាក់';
      b.className = 'px-5 py-2 rounded-full text-sm font-semibold transition';
      nav.appendChild(b);
    }
    const set = (btn, on) => {
      C.tabActive.split(' ').forEach(c => btn.classList.toggle(c, on));
      C.tabInactive.split(' ').forEach(c => btn.classList.toggle(c, !on));
      btn.classList.add('whitespace-nowrap', 'flex-none');
    };
    set(gid('tab-monthly'), activeTab === 'monthly');
    set(gid('tab-quarterly'), activeTab === 'quarterly');
    set(b, activeTab === 'roster');
    b.onclick = async () => { activeTab = 'roster'; editingId = null; selS.clear(); await loadRoster(); rrender(); };
  }

  // ---------- ទំព័រ ----------
  const field = (label, inner, cls = '') => `<label class="grid gap-1 ${cls}"><span class="text-xs text-slate-500">${label}</span>${inner}</label>`;

  function rowHtml(r, i, ed) {
    const id = String(r.id), group = i > 0 && list()[i - 1].teacher_id !== r.teacher_id;
    if (ed === id) {
      return `<tr class="bg-yellow-50">
        ${td('ជ្រើស', '')}${td('ល.រ', khNum(i + 1))}
        ${td('ឈ្មោះ', `<input id="rs_e_name" value="${esc(r.name)}" class="${C.input} ${EI}">`)}
        ${td('ភេទ', `<select id="rs_e_gender" class="${C.input} ${EI}"><option ${r.gender === 'ស្រី' ? 'selected' : ''}>ស្រី</option><option ${r.gender === 'ប្រុស' ? 'selected' : ''}>ប្រុស</option></select>`)}
        ${td('ភូមិ', `<input id="rs_e_village" value="${esc(r.village)}" class="${C.input} ${EI}">`)}
        ${td('ថ្ងៃខែឆ្នាំកំណើត', `<input id="rs_e_dob" type="date" value="${r.dob || ''}" class="${C.input} ${EI}">`)}
        ${td('លេខទូរសព្ទ', `<input id="rs_e_phone" value="${esc(r.phone)}" class="${C.input} ${EI}">`)}
        ${td('ថ្ងៃចូលរៀន', `<input id="rs_e_enr" type="date" value="${r.enrolled_at || ''}" class="${C.input} ${EI}">`)}
        ${td('ឡាន', `<input id="rs_e_bus" value="${esc(r.bus)}" class="${C.input} ${EI}">`)}
        ${isAdmin() ? td('គ្រូ', teacherPill(r.teacher_id)) : ''}
        ${td('ចំណាត់ថ្នាក់', '')}
        ${td('សកម្មភាព', `<button type="button" data-a="save" data-id="${id}" class="${C.save}">រក្សាទុក</button> <button type="button" data-a="cancel" class="${C.cancel}">បោះបង់</button>`, 'whitespace-nowrap')}
      </tr>`;
    }
    return `<tr class="bg-white hover:bg-brand/5 transition ${group ? 'border-t-2 border-slate-300' : ''}">
      ${td('ជ្រើស', `<input type="checkbox" class="${cb}" data-s="${id}" ${selected.has(id) ? 'checked' : ''}>`)}
      ${td('ល.រ', khNum(i + 1))}
      ${td('ឈ្មោះ', esc(r.name), 'font-medium')}
      ${td('ភេទ', esc(r.gender))}
      ${td('ភូមិ', esc(r.village))}
      ${td('ថ្ងៃខែឆ្នាំកំណើត', esc(formatKhmerDate(r.dob)))}
      ${td('លេខទូរសព្ទ', esc(r.phone))}
      ${td('ថ្ងៃចូលរៀន', esc(formatKhmerDate(r.enrolled_at)))}
      ${td('ឡាន', esc(r.bus))}
      ${isAdmin() ? td('គ្រូ', teacherPill(r.teacher_id)) : ''}
      ${td('ចំណាត់ថ្នាក់', `<select data-k="${id}" class="${C.input} !w-28"><option value="">—</option>${CLASS_RANKS.map(k => `<option ${ranks[id] === k ? 'selected' : ''}>${k}</option>`).join('')}</select>`)}
      ${td('សកម្មភាព', `<button type="button" data-a="edit" data-id="${id}" class="${C.edit}">កែ</button> <button type="button" data-a="del" data-id="${id}" class="${C.del}">លុប</button>`, 'whitespace-nowrap')}
    </tr>`;
  }

  function page() {
    const L = list(), ed = editRid(), n = pickedIds().length;
    const allOn = L.length && L.every(r => selected.has(String(r.id)));
    const heads = ['', 'ល.រ', 'ឈ្មោះ', 'ភេទ', 'ភូមិ', 'ថ្ងៃខែឆ្នាំកំណើត', 'លេខទូរសព្ទ', 'ថ្ងៃចូលរៀន', 'ឡាន', ...(isAdmin() ? ['គ្រូ'] : []), 'ចំណាត់ថ្នាក់', 'សកម្មភាព'];
    return `
    ${deadlineBanner()}
    ${loadErr ? `<div class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">មិនអាចទាញបញ្ជីសិស្សថ្នាក់បានទេ៖ ${esc(loadErr)}<br>ត្រូវប្រាកដថាបាន run roster-setup.sql ក្នុង Supabase project នេះ។</div>` : ''}
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
      ${stat('សិស្សក្នុងបញ្ជី', L.length, 'bg-brand')}
      ${stat('បានជ្រើស', n, 'bg-accent')}
      ${isAdmin() ? stat('គ្រូ', myTeachers().length, 'bg-emerald-500') : stat('សិស្សស្រី', L.filter(r => r.gender === 'ស្រី').length, 'bg-rose-500')}
    </div>
    <p class="text-sm text-slate-500 mb-4 px-1">រក្សាបញ្ជីសិស្សក្នុងថ្នាក់ម្តងគត់។ ដល់ពេលបំពេញ គ្រាន់តែធីកសិស្ស ជ្រើសចំណាត់ថ្នាក់ រួចចុច <b>បញ្ចូលទៅប្រចាំខែ</b> ឬ <b>ប្រចាំត្រីមាស</b>។</p>

    ${isAdmin() ? `<div class="${C.card} p-4 mb-5 flex flex-wrap items-center gap-3">
      <span class="text-sm font-semibold text-brand">គ្រូ</span>
      <select id="rs_who" class="${C.input} max-w-xs"><option value="">គ្រូទាំងអស់</option>${tOpts(who)}</select>
      ${who ? '' : '<span class="text-xs text-slate-500">ជ្រើសគ្រូជាមុន ទើបអាចបន្ថែម ឬនាំចូលសិស្សបាន</span>'}</div>` : ''}

    <h2 class="font-bold text-brand text-base sm:text-lg mt-2 mb-3 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>បន្ថែមសិស្សចូលបញ្ជីថ្នាក់</h2>
    <form id="rs_add" class="${C.card} p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
      ${field('ឈ្មោះសិស្ស', `<input id="rs_f_name" name="name" required placeholder="ឈ្មោះសិស្ស" class="${C.input}">`, 'col-span-2')}
      ${field('ភេទ', `<select id="rs_f_gender" name="gender" class="${C.input}"><option>ស្រី</option><option>ប្រុស</option></select>`)}
      ${field('ភូមិ', `<input id="rs_f_village" name="village" placeholder="ភូមិ" class="${C.input}">`)}
      ${field('ថ្ងៃខែឆ្នាំកំណើត', `<input id="rs_f_dob" name="dob" type="date" class="${C.input}">`)}
      ${field('លេខទូរសព្ទ', `<input id="rs_f_phone" name="phone" placeholder="លេខទូរសព្ទ" class="${C.input}">`)}
      ${field('ថ្ងៃចូលរៀន', `<input id="rs_f_enr" name="enr" type="date" class="${C.input}">`)}
      ${field('ឡាន', `<input id="rs_f_bus" name="bus" placeholder="ឡាន" class="${C.input}">`)}
      <button class="${C.btnAccent} col-span-2 md:col-span-4">បន្ថែមចូលបញ្ជីថ្នាក់</button>
    </form>

    <div class="flex flex-wrap items-center gap-3 mt-6 mb-3">
      <h2 class="font-bold text-brand text-base sm:text-lg flex-1 min-w-[12rem] flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>បញ្ជីសិស្សថ្នាក់ (${khNum(L.length)} នាក់)</h2>
      ${L.length ? `<label class="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" id="rs_all" class="${cb}" ${allOn ? 'checked' : ''}> ជ្រើសទាំងអស់</label>` : ''}
      <label class="${C.ghost} cursor-pointer">នាំចូលពី Excel<input id="rs_file" type="file" accept=".xlsx,.xls,.csv" class="hidden"></label>
    </div>

    <div class="${C.card} overflow-hidden">
      ${L.length ? `<div class="overflow-x-auto"><table class="w-full border-collapse responsive-table">
        <thead><tr>${heads.map(h => `<th class="${C.th}">${h}</th>`).join('')}</tr></thead>
        <tbody>${L.map((r, i) => rowHtml(r, i, ed)).join('')}</tbody></table></div>`
      : `<div class="p-12 text-center"><p class="text-slate-500">មិនទាន់មានសិស្សក្នុងបញ្ជីទេ។ នាំចូលពី Excel ឬបន្ថែមដោយដៃខាងលើ។</p></div>`}
    </div>

    ${n ? `<div class="sticky bottom-3 z-20 mt-4 ${C.card} shadow-lg p-3 flex flex-wrap items-center gap-2">
      <span class="text-sm font-semibold text-brand">បានជ្រើស ${khNum(n)} នាក់</span>
      <select id="rs_bulk" class="${C.input} max-w-[11rem]"><option value="">កំណត់ចំណាត់ថ្នាក់ទាំងអស់</option>${CLASS_RANKS.map(k => `<option>${k}</option>`).join('')}</select>
      <input id="rs_course" list="rs_cl" placeholder="វគ្គសិក្សា (សម្រាប់ត្រីមាស)" class="${C.input} max-w-[16rem]">
      <datalist id="rs_cl">${COURSES.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
      <span class="flex-1"></span>
      <button type="button" data-a="pm" class="${C.btnAccent}">បញ្ចូលទៅប្រចាំខែ</button>
      <button type="button" data-a="pq" class="${C.btn}">បញ្ចូលទៅប្រចាំត្រីមាស</button>
      <button type="button" data-a="delsel" class="${C.del} !py-2.5">លុបដែលបានជ្រើស</button>
      <button type="button" data-a="clr" class="${C.cancel} !py-2.5">បោះបង់</button></div>` : ''}`;
  }

  // ---------- សកម្មភាព ----------
  async function add(fd, form) {
    if (!target()) return alert('សូមជ្រើសគ្រូជាមុន (ខាងលើ)');
    const g = k => String(fd.get(k) ?? '').trim(), name = cleanName(g('name'));
    if (!name) return;
    if (rows.some(r => r.teacher_id === target() && norm(r.name) === norm(name))) return alert('សិស្សនេះមានក្នុងបញ្ជីរួចហើយ');
    const { error } = await sb.from(T).insert({ teacher_id: target(), name, gender: g('gender'), village: g('village'), dob: g('dob') || null, phone: g('phone'), enrolled_at: g('enr') || null, bus: g('bus') });
    if (error) return alert(error.message);
    form.reset();
    await loadRoster(); rrender();
    if (gid('rs_f_name')) gid('rs_f_name').focus();
  }

  async function save(id) {
    const v = k => gid('rs_e_' + k).value.trim();
    const { error } = await sb.from(T).update({ name: cleanName(v('name')), gender: v('gender'), village: v('village'), dob: v('dob') || null, phone: v('phone'), enrolled_at: v('enr') || null, bus: v('bus') }).eq('id', id);
    if (error) return alert('មិនអាចរក្សាទុកបានទេ: ' + error.message);
    editingId = null; await loadRoster(); rrender();
  }

  async function del(ids) {
    if (!ids.length) return alert('សូមជ្រើសសិស្សជាមុន');
    if (!confirm(`លុបសិស្ស ${ids.length} នាក់ចេញពីបញ្ជីថ្នាក់? (មិនប៉ះពាល់ទិន្នន័យប្រចាំខែ/ត្រីមាសទេ)`)) return;
    const { error } = await sb.from(T).delete().in('id', ids);
    if (error) return alert(error.message);
    ids.forEach(i => { selected.delete(String(i)); delete ranks[i]; });
    await loadRoster(); rrender();
  }

  async function importFile(file) {
    if (typeof XLSX === 'undefined') return alert('មិនទាន់ដាក់ script របស់ XLSX ក្នុង index.html ទេ');
    if (!target()) return alert('សូមជ្រើសគ្រូជាមុន (ខាងលើ) ព្រោះឯកសារមិនមានឈ្មោះគ្រូ');
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const sh = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
      const hi = sh.findIndex(r => r.some(c => norm(c).includes('ឈ្មោះ')) && r.some(c => /ភូមិ|ភេទ|កំណើត/.test(norm(c))));
      if (hi < 0) return alert('រកមិនឃើញជួរក្បាលតារាង (ឈ្មោះ, ភេទ, ភូមិ ...) ក្នុងឯកសារនេះទេ');
      const H = sh[hi].map(norm), col = f => H.findIndex(f);
      const c = { name: col(h => h.includes('ឈ្មោះ')), gender: col(h => h.includes('ភេទ')), village: col(h => h.includes('ភូមិ')), dob: col(h => h.includes('កំណើត')), phone: col(h => /ទូរ/.test(h)), enr: col(h => h.includes('ចូលរៀន')), bus: col(h => h.includes('ឡាន')) };
      const val = (r, k) => (c[k] >= 0 ? r[c[k]] : '');
      const str = (r, k) => String(val(r, k) ?? '').trim();
      const have = new Set(rows.filter(r => r.teacher_id === target()).map(r => norm(r.name)));
      const out = []; let dup = 0;
      sh.slice(hi + 1).forEach(r => {
        const name = cleanName(val(r, 'name'));
        if (!name) return;
        if (have.has(norm(name))) { dup++; return; }
        have.add(norm(name));
        let phone = str(r, 'phone');
        if (typeof val(r, 'phone') === 'number' && phone.length === 9) phone = '0' + phone;   // Excel កាត់លេខ ០ ខាងមុខ
        out.push({ teacher_id: target(), name, gender: GENDER(val(r, 'gender')), village: str(r, 'village'), dob: parseDob(val(r, 'dob')), phone, enrolled_at: parseDob(val(r, 'enr')), bus: str(r, 'bus') });
      });
      if (!out.length) return alert('គ្មានសិស្សថ្មីត្រូវនាំចូលទេ' + (dup ? ` (ស្ទួន ${dup} នាក់)` : ''));
      if (!confirm(`រកឃើញសិស្សថ្មី ${out.length} នាក់។ នាំចូលចូលបញ្ជីថ្នាក់?`)) return;
      for (let i = 0; i < out.length; i += 200) {
        const { error } = await sb.from(T).insert(out.slice(i, i + 200));
        if (error) return alert('នាំចូលមិនបានទេ: ' + error.message);
      }
      await loadRoster(); rrender();
      alert(`នាំចូលបាន ${out.length} នាក់` + (dup ? `\nស្ទួន (រំលង): ${dup}` : ''));
    } catch (err) { console.error(err); alert('មិនអាចអានឯកសារបានទេ: ' + err.message); }
  }

  // ជ្រើសសិស្ស + ចំណាត់ថ្នាក់ → បញ្ចូលទៅប្រចាំខែ ឬប្រចាំត្រីមាស
  async function push(dest) {
    const ids = new Set(pickedIds()), pick = list().filter(r => ids.has(String(r.id)));
    if (!pick.length) return alert('សូមជ្រើសសិស្សជាមុន');
    const miss = pick.filter(r => !ranks[r.id]);
    if (miss.length) return alert('សូមជ្រើសចំណាត់ថ្នាក់សម្រាប់៖\n' + miss.map(r => r.name).join(', '));
    const quarterly = dest === 'quarterly', course = (gid('rs_course')?.value || '').trim();
    const seen = new Set((quarterly ? students : monthlyStudents).map(s => s.teacher_id + '|' + norm(s.name)));
    const add = []; let dup = 0;
    pick.forEach(r => {
      const k = r.teacher_id + '|' + norm(r.name);
      if (seen.has(k)) { dup++; return; }
      seen.add(k);
      add.push(quarterly ? { teacher_id: r.teacher_id, name: r.name, gender: r.gender, class_no: ranks[r.id], dob: r.dob, course } : { teacher_id: r.teacher_id, name: r.name, class_no: ranks[r.id] });
    });
    const label = quarterly ? 'ប្រចាំត្រីមាស' : 'ប្រចាំខែ';
    if (!add.length) return alert(`សិស្សទាំងនេះមានក្នុង${label}រួចហើយ (ស្ទួន ${dup} នាក់)`);
    const { error } = await sb.from(quarterly ? 'students' : 'monthly_students').insert(add);
    if (error) return alert('បញ្ចូលមិនបានទេ: ' + error.message);
    selected = new Set(); ranks = {};
    activeTab = dest; await load(); render();
    alert(`បញ្ចូលបាន ${add.length} នាក់ទៅ${label}` + (dup ? `\nស្ទួន (រំលង): ${dup}` : ''));
  }

  function bind(main) {
    main.onclick = async e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'edit') { editingId = 'r' + b.dataset.id; rrender(); }
      else if (a === 'cancel') { editingId = null; rrender(); }
      else if (a === 'save') await save(b.dataset.id);
      else if (a === 'del') await del([b.dataset.id]);
      else if (a === 'delsel') await del(pickedIds());
      else if (a === 'clr') { selected.clear(); rerender(); }
      else if (a === 'pm') await push('monthly');
      else if (a === 'pq') await push('quarterly');
    };
    main.onsubmit = async e => { e.preventDefault(); if (e.target.id === 'rs_add') await add(new FormData(e.target), e.target); };
    main.onchange = async e => {
      const t = e.target;
      if (t.dataset.s !== undefined) { t.checked ? selected.add(t.dataset.s) : selected.delete(t.dataset.s); rerender(); }
      else if (t.dataset.k !== undefined) ranks[t.dataset.k] = t.value;
      else if (t.id === 'rs_all') { list().forEach(r => t.checked ? selected.add(String(r.id)) : selected.delete(String(r.id))); rerender(); }
      else if (t.id === 'rs_who') { who = t.value; selected.clear(); rrender(); }
      else if (t.id === 'rs_bulk') { if (t.value) { pickedIds().forEach(id => { ranks[id] = t.value; }); rerender(); } }
      else if (t.id === 'rs_file') { const f = t.files[0]; t.value = ''; if (f) await importFile(f); }
    };
  }

  // ---------- ភ្ជាប់ចូល render() / load() របស់ app.js ----------
  const _render = window.render, _load = window.load;
  window.load = async function () {
    await _load(); if (activeTab === 'roster') await loadRoster();
    justLoaded = true; setTimeout(() => { justLoaded = false; }, 0);   // ដឹងថា render ខាងក្រោយ មកពី auto reload
  };
  window.render = function () {
    // កុំ render ស្វ័យប្រវត្តិ (auto reload) ពេលកំពុងវាយក្នុងទម្រង់បន្ថែម
    const f = gid('rs_add');
    if (activeTab === 'roster' && justLoaded && !force && f && f.contains(document.activeElement) && document.activeElement !== f) return;
    const keep = {};
    KEEP.forEach(id => { const el = gid(id); if (el) keep[id] = el.value; });
    _render();
    injectTab();
    if (activeTab !== 'roster') return;
    const main = document.querySelector('#app main');
    if (!main) return;
    main.innerHTML = page();
    bind(main);
    KEEP.forEach(id => { const el = gid(id); if (el && keep[id] !== undefined) el.value = keep[id]; });
  };
  if (me && gid('tab-monthly')) injectTab();   // បើ app.js render រួចមុន roster.js ផ្ទុកចប់
})();
