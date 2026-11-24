// ===== roster.js · tab "បញ្ជីឈ្មោះសិស្ស" =====
(() => {
  const T = 'roster_students';
  const SHIFTS = ['ព្រឹក', 'ថ្ងៃ', 'ល្ងាច'];
  const SHIFT_CLR = { 'ព្រឹក': 'bg-amber-100 text-amber-800', 'ថ្ងៃ': 'bg-sky-100 text-sky-800', 'ល្ងាច': 'bg-violet-100 text-violet-800' };
  const GENDER = v => { const s = String(v ?? '').trim(); return /^(ស្រី|ស|f|female)$/i.test(s) ? 'ស្រី' : /^(ប្រុស|ប|m|male)$/i.test(s) ? 'ប្រុស' : s; };
  const normShift = v => { const s = String(v ?? '').toLowerCase(); return /ព្រឹក|morning|am/.test(s) ? 'ព្រឹក' : /ល្ងាច|evening|night/.test(s) ? 'ល្ងាច' : /ថ្ងៃ|afternoon|noon/.test(s) ? 'ថ្ងៃ' : ''; };
  const gid = id => document.getElementById(id);
  const NDT = 'គ្មានទិន្នន័យ';
  const nd = v => (v === null || v === undefined || String(v).trim() === '') ? `<span style="color:#94a3b8;font-size:12px;font-weight:400">${NDT}</span>` : esc(v);
  const ndx = v => (v === null || v === undefined || String(v).trim() === '') ? NDT : v;   // សម្រាប់ Excel/PDF
  const cb = 'cb checked:bg-brand checked:border-brand';
  const fail = (m, error) => alert(m + (error ? error.message : '') + (error && /shift|photo_path/i.test(error.message) ? '\n(ត្រូវ run roster-add-columns.sql ក្នុង Supabase ម្តងសិន ដើម្បីបន្ថែមជួរ "វេន" និង "រូបថត")' : ''));

  let rows = [], removed = [], err = '', q = '', shiftF = '', who = '', editId = null;
  const sel = new Set();
  const target = () => (isAdmin() ? ((gid('rs_a_t') && gid('rs_a_t').value) || who) : me.id);
  const locked = async () => { if (!isAdmin() && await isLocked()) { alert(LOCK_MSG); return true; } return false; };
  const base = () => rows.filter(r => !who || r.teacher_id === who);
  const visible = () => {
    const nq = norm(q).toLowerCase();
    return base().filter(r => (!shiftF || (shiftF === '_' ? !r.shift : r.shift === shiftF))
      && (!nq || [r.name, r.village, r.phone, r.bus].some(v => norm(v).toLowerCase().includes(nq))));
  };

  // ---------- រូបថត ----------
  async function loadRosterPhotos() {
    const now = Date.now();
    const need = [...new Set(rows.map(x => x.photo_path).filter(p => p && !(photoUrls[p] && photoUrls[p].exp > now + 600000)))];
    if (!need.length) return;
    const { data } = await sb.storage.from(PHOTO_BUCKET).createSignedUrls(need, 3600);
    (data || []).forEach(d => { if (d.signedUrl) photoUrls[d.path] = { url: d.signedUrl, exp: now + 3600000 }; });
  }

  async function loadRoster() {
    if (!me) return;
    const ids = teachers.map(t => t.id);
    if (!ids.length) { rows = []; removed = []; err = ''; return; }
    const { data, error } = await sb.from(T).select('*').in('teacher_id', ids);
    if (error) { err = error.message; rows = []; removed = []; return; }
    err = '';
    const all = (data || []).sort((a, b) => tIndex(a.teacher_id) - tIndex(b.teacher_id) || a.id - b.id);
    rows = all.filter(r => !r.deleted_at);                                   // សិស្សសកម្ម
    removed = all.filter(r => r.deleted_at).sort((a, b) => String(b.deleted_at).localeCompare(String(a.deleted_at)));   // សិស្សដែលបានលុប (រក្សាទុក)
    const have = new Set(rows.map(r => String(r.id)));
    [...sel].forEach(i => { if (!have.has(i)) sel.delete(i); });
    await loadRosterPhotos();
  }
  const reload = async () => { await loadRoster(); drawDyn(); };

  // ---------- Tab ក្នុងរបារ ----------
  function injectTab() {
    const nav = document.querySelector('#app nav > div');
    if (!nav) return;
    nav.classList.add('overflow-x-auto');
    let b = gid('tab-roster');
    if (!b) {
      b = document.createElement('button');
      b.id = 'tab-roster';
      b.textContent = 'បញ្ជីឈ្មោះសិស្ស'; 
      b.className = 'px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap flex-none';
      nav.prepend(b); 
    }
    const set = (btn, on) => {
      C.tabActive.split(' ').forEach(c => btn.classList.toggle(c, on));
      C.tabInactive.split(' ').forEach(c => btn.classList.toggle(c, !on));
      btn.classList.add('whitespace-nowrap', 'flex-none');
    };
    set(gid('tab-monthly'), activeTab === 'monthly');
    set(gid('tab-quarterly'), activeTab === 'quarterly');
    set(b, activeTab === 'roster');
    b.onclick = async () => { activeTab = 'roster'; editingId = null; selS.clear(); await loadRoster(); render(); };
  }

  // ---------- ស៊ុមទំព័រ ----------
  const fld = (l, html) => `<label class="grid gap-1 text-xs font-semibold text-slate-500">${l}${html}</label>`;
  const shiftOpts = (v, none = '—') => `<option value="">${none}</option>${SHIFTS.map(s => `<option value="${s}" ${v === s ? 'selected' : ''}>វេន${s}</option>`).join('')}`;

  function shell() {
    return `
    ${deadlineBanner()}
    ${err ? `<div class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">មិនអាចទាញបញ្ជីសិស្សថ្នាក់បានទេ៖ ${esc(err)}</div>` : ''}
    <div id="rs_root">
      <div id="rs_stats" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5"></div>

      <h2 class="font-bold text-brand text-base sm:text-lg mb-3 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>បន្ថែមសិស្សចូលបញ្ជីថ្នាក់</h2>
      <form id="rs_add" class="${C.form}">
        ${isAdmin() ? fld('គ្រូ', `<select id="rs_a_t" required class="${C.input}"><option value="">ជ្រើសរើសគ្រូ</option>${tOpts(who)}</select>`) : ''}
        ${fld('ឈ្មោះសិស្ស', `<input id="rs_a_name" name="name" required placeholder="ឈ្មោះសិស្ស" class="${C.input}">`)}
        ${fld('ភេទ', `<select id="rs_a_gender" name="gender" class="${C.input}"><option>ស្រី</option><option>ប្រុស</option></select>`)}
        ${fld('វេន', `<select id="rs_a_shift" name="shift" class="${C.input}">${shiftOpts(SHIFTS.includes(shiftF) ? shiftF : '', 'មិនទាន់កំណត់')}</select>`)}
        ${fld('ភូមិ', `<input id="rs_a_village" name="village" placeholder="ភូមិ" class="${C.input}">`)}
        ${fld('ថ្ងៃខែឆ្នាំកំណើត', `<input id="rs_a_dob" name="dob" type="date" class="${C.input}">`)}
        ${fld('លេខទូរសព្ទ', `<input id="rs_a_phone" name="phone" placeholder="លេខទូរសព្ទ" class="${C.input}">`)}
        ${fld('ថ្ងៃចូលរៀន', `<input id="rs_a_enr" name="enr" type="date" class="${C.input}">`)}
        ${fld('ឡាន', `<input id="rs_a_bus" name="bus" placeholder="ឡាន" class="${C.input}">`)}
        
        ${fld('រូបថត', `<input id="rs_a_photo" type="file" accept="image/*" class="${C.input} text-xs pt-2">`)}
        ${fld('&nbsp;', `<button type="submit" class="w-full bg-brand text-white rounded-xl px-4 py-2.5 hover:brightness-110 active:scale-95 transition font-semibold text-sm shadow-sm">បន្ថែមសិស្សចូលថ្មី</button>`)}
      </form>

      <h2 class="font-bold text-brand text-base sm:text-lg mt-8 mb-3 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>បញ្ជីឈ្មោះសិស្ស</h2>
      <div class="${C.card} p-4 mb-3 grid gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <input id="rs_q" type="search" value="${esc(q)}" placeholder="ស្វែងរកសិស្ស (ឈ្មោះ ភូមិ លេខទូរសព្ទ ឡាន)" class="${C.input} flex-1 min-w-[14rem]">
          ${isAdmin() ? `<select id="rs_who" class="${C.input} max-w-xs"><option value="">គ្រូទាំងអស់</option>${tOpts(who)}</select>` : ''}
          <label class="${C.ghost} cursor-pointer">នាំចូលពី Excel<input id="rs_file" type="file" accept=".xlsx,.xls,.csv" class="hidden"></label>
        </div>
        <div id="rs_pills" class="flex flex-wrap gap-2"></div>
      </div>
      
      <div id="rs_bulk" class="mb-3"></div>
      <div id="rs_table"></div>
      <div id="rs_removed" class="mt-10"></div>
    </div>`;
  }

  function drawDyn() { if (!gid('rs_root')) return; drawList(); }

  function drawList() {
    const vis = visible(), b = base();
    gid('rs_stats').innerHTML =
      stat('សិស្សក្នុងបញ្ជី', rows.length, 'bg-brand') +
      stat('កំពុងបង្ហាញ', vis.length, 'bg-emerald-500') +
      stat('វេនព្រឹក/ថ្ងៃ/ល្ងាច', b.filter(r => r.shift === 'ព្រឹក').length + '/' + b.filter(r => r.shift === 'ថ្ងៃ').length + '/' + b.filter(r => r.shift === 'ល្ងាច').length, 'bg-accent');

    const cnt = s => b.filter(r => s === '' ? true : s === '_' ? !r.shift : r.shift === s).length;
    const pill = (v, label) => (v === '_' && !cnt(v) && shiftF !== '_') ? '' :
      `<button type="button" data-sf="${v}" class="px-4 py-1.5 rounded-full text-sm font-semibold border transition ${shiftF === v ? 'bg-brand text-white border-brand shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">${label} <span class="${shiftF === v ? 'text-white/80' : 'text-slate-400'} text-xs">${khNum(cnt(v))}</span></button>`;
    gid('rs_pills').innerHTML = pill('', 'ទាំងអស់') + SHIFTS.map(s => pill(s, 'វេន' + s)).join('') + pill('_', 'មិនទាន់កំណត់វេន');

    // បង្ហាញប៊ូតុង Export ជានិច្ច
    gid('rs_bulk').innerHTML = `<div class="flex flex-wrap items-center gap-3 mb-3 px-4 py-3 rounded-xl bg-brand/5 border border-brand/20">
      <span class="text-sm font-semibold text-brand flex-1">ចំនួនសិស្សក្នុងបញ្ជីខាងក្រោម: ${khNum(vis.length)} នាក់</span>
      <button type="button" data-a="exportExcel" class="${C.ghost} !py-2.5 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"> ទាញយក Excel</button>
      <button type="button" data-a="exportPdf" class="${C.ghost} !py-2.5 bg-red-50 text-red-700 border-red-300 hover:bg-red-100"> ទាញយក PDF</button>
    </div>`;

    const admin = isAdmin();
    const heads = ['ល.រ', 'ឈ្មោះ', 'ភេទ', 'ភូមិ', 'ថ្ងៃខែឆ្នាំកំណើត', 'លេខទូរសព្ទ', 'ថ្ងៃចូលរៀន', 'ឡាន', 'វេន', ...(admin ? ['គ្រូ'] : []), 'សកម្មភាព'];
    const view = (r, i) => `<tr class="bg-white hover:bg-brand/10 transition ${admin && i > 0 && vis[i - 1].teacher_id !== r.teacher_id ? 'border-t-2 border-slate-300' : ''}">
      ${td('ជ្រើស', `<input type="checkbox" class="${cb}" data-s="${r.id}" ${sel.has(String(r.id)) ? 'checked' : ''}>`)}
      ${td('ល.រ', khNum(i + 1))}
      ${td('ឈ្មោះ', `<div class="flex items-center gap-3">${photoCell(r)}<span>${esc(r.name)}</span></div>`, 'font-medium')}
      ${td('ភេទ', nd(r.gender))}
      ${td('ភូមិ', nd(r.village))}
      ${td('ថ្ងៃខែឆ្នាំកំណើត', nd(r.dob ? formatKhmerDate(r.dob) : ''))}
      ${td('លេខទូរសព្ទ', nd(r.phone))}
      ${td('ថ្ងៃចូលរៀន', nd(r.enrolled_at ? formatKhmerDate(r.enrolled_at) : ''))}
      ${td('ឡាន', nd(r.bus))}
      ${td('វេន', `<select data-sh="${r.id}" class="${C.input} !w-28">${shiftOpts(r.shift)}</select>`)}
      ${admin ? td('គ្រូ', teacherPill(r.teacher_id)) : ''}
      ${td('សកម្មភាព', `<button type="button" data-a="photo" data-id="${r.id}" class="${C.edit}">រូបថត</button> <button type="button" data-a="edit" data-id="${r.id}" class="${C.edit}">កែ</button> <button type="button" data-a="del" data-id="${r.id}" class="${C.del}">លុប</button>`, 'whitespace-nowrap')}
    </tr>`;
    const edit = (r, i) => `<tr class="bg-yellow-50">
      ${td('ជ្រើស', '')}${td('ល.រ', khNum(i + 1))}
      ${td('ឈ្មោះ', `<input id="rs_e_name" value="${esc(r.name)}" class="${C.input} min-w-[9rem]"><input type="file" id="rs_e_photo" accept="image/*" class="text-xs mt-2 max-w-[220px]" title="ប្តូររូបថត">`)}
      ${td('ភេទ', `<select id="rs_e_gender" class="${C.input}"><option ${r.gender === 'ស្រី' ? 'selected' : ''}>ស្រី</option><option ${r.gender === 'ប្រុស' ? 'selected' : ''}>ប្រុស</option></select>`)}
      ${td('ភូមិ', `<input id="rs_e_village" value="${esc(r.village)}" class="${C.input} min-w-[9rem]">`)}
      ${td('ថ្ងៃខែឆ្នាំកំណើត', `<input id="rs_e_dob" type="date" value="${r.dob || ''}" class="${C.input}">`)}
      ${td('លេខទូរសព្ទ', `<input id="rs_e_phone" value="${esc(r.phone)}" class="${C.input} min-w-[9rem]">`)}
      ${td('ថ្ងៃចូលរៀន', `<input id="rs_e_enr" type="date" value="${r.enrolled_at || ''}" class="${C.input}">`)}
      ${td('ឡាន', `<input id="rs_e_bus" value="${esc(r.bus)}" class="${C.input} min-w-[6rem]">`)}
      ${td('វេន', `<select id="rs_e_shift" class="${C.input} !w-28">${shiftOpts(r.shift)}</select>`)}
      ${admin ? td('គ្រូ', teacherPill(r.teacher_id)) : ''}
      ${td('សកម្មភាព', `<button type="button" data-a="save" data-id="${r.id}" class="${C.save}">រក្សាទុក</button> <button type="button" data-a="cancel" class="${C.cancel}">បោះបង់</button>`, 'whitespace-nowrap')}
    </tr>`;

    gid('rs_table').innerHTML = vis.length
      ? `<label class="inline-flex items-center gap-2 text-sm text-slate-600 mb-3 px-1 cursor-pointer"><input type="checkbox" id="rs_all" class="${cb}" ${vis.every(r => sel.has(String(r.id))) ? 'checked' : ''}> ជ្រើសទាំងអស់ដែលកំពុងបង្ហាញ (${khNum(vis.length)})</label>
        <div class="${C.card} overflow-hidden"><div class="overflow-x-auto"><table class="w-full border-collapse responsive-table">
          <thead><tr><th class="${C.th} w-10"></th>${heads.map(h => `<th class="${C.th}">${h}</th>`).join('')}</tr></thead>
          <tbody>${vis.map((r, i) => String(r.id) === String(editId) ? edit(r, i) : view(r, i)).join('')}</tbody></table></div></div>`
      : `<div class="${C.card} p-12 text-center text-slate-500">${NDT}<div class="text-xs mt-2">${rows.length ? 'រកមិនឃើញសិស្សតាមការស្វែងរក ឬវេនដែលបានជ្រើសទេ។' : 'បន្ថែមសិស្សដោយដៃខាងលើ ឬនាំចូលពី Excel។'}</div></div>`;
    drawRemoved();
  }

  // ---------- សិស្សដែលបានលុប (នៅខាងក្រោមបំផុតនៃបញ្ជី) ----------
  function drawRemoved() {
    const el = gid('rs_removed');
    if (!el) return;
    const list = removed.filter(r => !who || r.teacher_id === who), admin = isAdmin();
    const head = `<h2 class="font-bold text-slate-600 text-base sm:text-lg mb-3 flex items-center gap-2"><span class="w-1 h-5 bg-slate-400 rounded"></span>សិស្សដែលបានលុប (${khNum(list.length)} នាក់)</h2>`;
    if (!list.length) { el.innerHTML = head + `<div class="${C.card} p-8 text-center text-slate-500">${NDT}</div>`; return; }
    const heads = ['ល.រ', 'ឈ្មោះ', 'ភេទ', 'វេន', ...(admin ? ['គ្រូ'] : []), 'ថ្ងៃដែលបានលុប', ...(admin ? ['សកម្មភាព'] : [])];
    el.innerHTML = head + `<p class="text-xs text-slate-500 mb-2">សិស្សទាំងនេះមិនបង្ហាញក្នុងបញ្ជីខាងលើ និងមិនរាប់ក្នុងតារាងលទ្ធផលទេ។ មានតែ admin ទេដែលអាចស្ដារវិញបាន។ គ្មានអ្នកណាអាចលុបចោលជារៀងរហូតពីប្រព័ន្ធនេះបានទេ។</p>
      <div class="${C.card} overflow-hidden"><div class="overflow-x-auto"><table class="w-full border-collapse responsive-table">
        <thead><tr>${heads.map(h => `<th class="${C.th}">${h}</th>`).join('')}</tr></thead>
        <tbody>${list.map((r, i) => `<tr class="bg-slate-50 text-slate-600">
          ${td('ល.រ', khNum(i + 1))}${td('ឈ្មោះ', esc(r.name), 'font-medium')}${td('ភេទ', nd(r.gender))}${td('វេន', r.shift ? 'វេន' + esc(r.shift) : nd(''))}
          ${admin ? td('គ្រូ', teacherPill(r.teacher_id)) : ''}
          ${td('ថ្ងៃដែលបានលុប', esc(formatKhmerDate(String(r.deleted_at).slice(0, 10))))}
          ${admin ? td('សកម្មភាព', `<button type="button" data-a="restore" data-id="${r.id}" class="${C.edit}">ស្ដារវិញ</button>`, 'whitespace-nowrap') : ''}
        </tr>`).join('')}</tbody></table></div></div>`;
  }

  // ---------- សកម្មភាព ----------
  async function add(fd) {
    const tid = target();
    if (!tid) return alert('សូមជ្រើសគ្រូជាមុន');
    const g = k => String(fd.get(k) ?? '').trim(), name = cleanName(g('name'));
    if (!name) return;
    if (rows.some(r => r.teacher_id === tid && norm(r.name) === norm(name))) return alert('សិស្សនេះមានក្នុងបញ្ជីរួចហើយ');
    if (removed.some(r => r.teacher_id === tid && norm(r.name) === norm(name))) return alert('សិស្សនេះមានក្នុងបញ្ជី "សិស្សដែលបានលុប" ខាងក្រោមរួចហើយ សូមឱ្យ admin ស្ដារវិញ');
    const { data: ins, error } = await sb.from(T).insert({ teacher_id: tid, name, gender: g('gender'), village: g('village'), dob: g('dob') || null, phone: g('phone'), enrolled_at: g('enr') || null, bus: g('bus'), shift: g('shift') || null }).select('id').single();
    if (error) return fail('បន្ថែមមិនបានទេ: ', error);
    const pf = gid('rs_a_photo') && gid('rs_a_photo').files[0];
    if (pf) { try { await uploadPhoto(tid, ins.id, pf, null, T); } catch (e) { fail('រក្សាទុកសិស្សរួច ប៉ុន្តែរូបថតមិនបានចូលទេ: ', e); } }
    ['name', 'village', 'phone', 'bus', 'dob', 'photo'].forEach(k => { const el = gid('rs_a_' + k); if (el) el.value = ''; });
    await reload();
    gid('rs_a_name') && gid('rs_a_name').focus();
  }

  async function save(id) {
    const v = k => gid('rs_e_' + k).value.trim();
    const { error } = await sb.from(T).update({ name: cleanName(v('name')), gender: v('gender'), village: v('village'), dob: v('dob') || null, phone: v('phone'), enrolled_at: v('enr') || null, bus: v('bus'), shift: v('shift') || null }).eq('id', id);
    if (error) return fail('មិនអាចរក្សាទុកបានទេ: ', error);
    const pf = gid('rs_e_photo') && gid('rs_e_photo').files[0];
    if (pf) {
      const cur = rows.find(x => String(x.id) === String(id));
      try { await uploadPhoto(cur.teacher_id, cur.id, pf, cur.photo_path, T); } catch (e) { fail('រូបថតមិនបានចូលទេ: ', e); }
    }
    editId = null; await loadRoster(); drawDyn();
  }

  const softHint = e => /deleted_at/i.test((e && e.message) || '') ? '\n(ត្រូវ run roster-soft-delete.sql ក្នុង Supabase ម្តងសិន)' : '';
  async function del(ids) {
    if (!ids.length) return alert('សូមជ្រើសសិស្សជាមុន');
    if (!confirm(`ដកសិស្ស ${ids.length} នាក់ចេញពីបញ្ជីថ្នាក់?\n(សិស្សនឹងត្រូវរក្សាទុកក្នុង "សិស្សដែលបានលុប" នៅខាងក្រោមបំផុត ហើយអាចស្ដារវិញបាន។ ទិន្នន័យពិន្ទុមិនបាត់ទេ)`)) return;
    const { error } = await sb.from(T).update({ deleted_at: new Date().toISOString() }).in('id', ids);
    if (error) return alert('លុបមិនបានទេ: ' + error.message + softHint(error));
    ids.forEach(i => { sel.delete(String(i)); });
    await reload();
  }

  async function restore(id) {
    if (!isAdmin()) return alert('មានតែ admin ទេដែលអាចស្ដារសិស្សវិញបាន');
    const { error } = await sb.from(T).update({ deleted_at: null }).eq('id', id);
    if (error) return alert('ស្ដារមិនបានទេ: ' + error.message + softHint(error));
    await reload();
  }

  async function setShift(ids, v) {
    const { error } = await sb.from(T).update({ shift: v || null }).in('id', ids);
    if (error) { fail('កំណត់វេនមិនបានទេ: ', error); return reload(); }
    const set = new Set(ids.map(String));
    rows.forEach(r => { if (set.has(String(r.id))) r.shift = v || null; });
    drawDyn();
  }

  async function importFile(file) {
    if (typeof XLSX === 'undefined') return alert('មិនទាន់ដាក់ script របស់ XLSX ក្នុង index.html ទេ');
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const sh = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
      const hi = sh.findIndex(r => r.some(c => { const h = norm(c); return h.includes('ឈ្មោះ') && !h.includes('គ្រូ'); }));
      if (hi < 0) return alert('រកមិនឃើញជួរក្បាលតារាង "ឈ្មោះ" ក្នុងឯកសារនេះទេ');
      const H = sh[hi].map(norm), col = f => H.findIndex(f);
      const c = {
        name: col(h => h.includes('ឈ្មោះ') && !h.includes('គ្រូ')), teacher: col(h => h.includes('ឈ្មោះគ្រូ')),
        gender: col(h => h.includes('ភេទ')), village: col(h => h.includes('ភូមិ')), dob: col(h => h.includes('កំណើត')),
        phone: col(h => /ទូរ/.test(h)), enr: col(h => h.includes('ចូលរៀន')), bus: col(h => h.includes('ឡាន')), shift: col(h => h.includes('វេន'))
      };
      let fixed = null;
      if (isAdmin() && c.teacher < 0) {
        fixed = target();
        if (!fixed) return alert('ឯកសារគ្មានជួរ "ឈ្មោះគ្រូ" ទេ។ សូមជ្រើសគ្រូក្នុងទម្រង់ "បន្ថែមសិស្សចូលបញ្ជីថ្នាក់" ឬតម្រងគ្រូជាមុន រួចនាំចូលម្តងទៀត។');
      }
      const tmap = new Map(myTeachers().map(t => [norm(t.name), t.id]));
      const val = (r, k) => (c[k] >= 0 ? r[c[k]] : '');
      const str = (r, k) => String(val(r, k) ?? '').trim();
      const defShift = SHIFTS.includes(shiftF) ? shiftF : '';
      const seen = new Set([...rows, ...removed].map(r => r.teacher_id + '|' + norm(r.name)));
      const out = [], unmatched = new Set(); let dup = 0;
      sh.slice(hi + 1).forEach(r => {
        const name = cleanName(val(r, 'name'));
        if (!name) return;
        const tid = !isAdmin() ? me.id : (fixed || tmap.get(norm(val(r, 'teacher'))));
        if (!tid) { unmatched.add(str(r, 'teacher') || '(គ្មានឈ្មោះគ្រូ)'); return; }
        const k = tid + '|' + norm(name);
        if (seen.has(k)) { dup++; return; }
        seen.add(k);
        let phone = str(r, 'phone');
        if (typeof val(r, 'phone') === 'number' && phone.length === 9) phone = '0' + phone;   // Excel កាត់លេខ ០ ខាងមុខ
        out.push({ teacher_id: tid, name, gender: GENDER(val(r, 'gender')), village: str(r, 'village'), dob: parseDob(val(r, 'dob')), phone, enrolled_at: parseDob(val(r, 'enr')), bus: str(r, 'bus'), shift: normShift(val(r, 'shift')) || defShift || null });
      });
      const summary = (dup ? `ស្ទួន (រំលង): ${dup}` : '') + (unmatched.size ? `\nរកមិនឃើញគ្រូ (រំលង): ${[...unmatched].join(', ')}` : '');
      if (!out.length) return alert('គ្មានសិស្សថ្មីត្រូវនាំចូលទេ។\n' + summary);
      if (!confirm(`រកឃើញសិស្សថ្មី ${out.length} នាក់។ នាំចូលចូលបញ្ជីថ្នាក់?` + (c.shift < 0 && defShift ? `\n(វេន${defShift})` : ''))) return;
      for (let i = 0; i < out.length; i += 200) {
        const { error } = await sb.from(T).insert(out.slice(i, i + 200));
        if (error) return fail('នាំចូលមិនបានទេ: ', error);
      }
      await reload();
      alert(`នាំចូលបាន ${out.length} នាក់` + (summary ? '\n' + summary : ''));
    } catch (e) { console.error(e); alert('មិនអាចអានឯកសារបានទេ: ' + e.message); }
  }

  // ---------- ទាញយក Excel / PDF (តាមគំរូ Excel របស់សាលា) ----------
  const SCHOOL_KH = 'សាលាអន្តរទ្វីប ខូស្បេស៍';
  const SCHOOL_EN = 'Co Space Intercon School';
  const F_MOUL = 'Khmer OS Moul Light', F_BODY = 'Khmer OS Battambang';
  const KH_M = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

  // 2015-11-23 -> 23.11.2015
  const dmy = v => { const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}.${m[2]}.${m[1]}` : (v || ''); };
  // ស្រី -> ស, ប្រុស -> ប
  const sexShort = g => /ស្រី|^ស$/.test(g || '') ? 'ស' : /ប្រុស|^ប$/.test(g || '') ? 'ប' : (g || '');
  const busVal = b => { const s = String(b ?? '').trim(); return /^\d+$/.test(s) ? Number(s) : s; };

  function exportInfo() {
    const data = visible();
    const teacherName = who ? tname(who) : (isAdmin() ? 'គ្រូទាំងអស់' : me.name);
    const shiftName = shiftF ? (shiftF === '_' ? 'មិនកំណត់វេន' : 'វេន' + shiftF) : '';
    const now = new Date();
    const dateText = `ធ្វើនៅថ្ងៃទី ${khNum(now.getDate())} ខែ ${KH_M[now.getMonth()]} ឆ្នាំ${khNum(now.getFullYear())}`;
    const title = `បញ្ជីឈ្មោះសិស្សថ្នាក់អ្នកគ្រូ ${teacherName}${shiftName ? ' ' + shiftName : ''}`;
    const head = ['ល.រ', 'ឈ្មោះ', 'ភេទ', 'ភូមិ', 'ថ្ងៃខែឆ្នាំកំណើត', 'លេខទូរស័ព្ទ', 'ថ្ងៃចូលរៀន', 'ឡាន'];
    const body = data.map((r, i) => [i + 1, r.name || '', ndx(sexShort(r.gender)), ndx(r.village), ndx(dmy(r.dob)), ndx(r.phone), ndx(dmy(r.enrolled_at)), ndx(busVal(r.bus))]);
    return { teacherName, shiftName, dateText, title, head, body };
  }

  async function exportExcel() {
    if (typeof ExcelJS === 'undefined') return alert('មិនទាន់ដាក់ script របស់ ExcelJS ក្នុង index.html ទេ');
    const { teacherName, shiftName, dateText, title, head, body } = exportInfo();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('បញ្ជីឈ្មោះសិស្ស', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true }
    });
    ws.pageSetup.printTitlesRow = '6:6';
    ws.columns = [{ width: 6 }, { width: 24 }, { width: 7 }, { width: 14 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 8 }];

    const thin = { style: 'thin' }, bd = { top: thin, left: thin, bottom: thin, right: thin };
    const ctr = { horizontal: 'center', vertical: 'middle' };
    const put = (r, c1, c2, text, font, h = 19.35) => {
      if (c2 > c1) ws.mergeCells(r, c1, r, c2);
      const cell = ws.getCell(r, c1);
      cell.value = text; cell.font = font; cell.alignment = ctr;
      ws.getRow(r).height = h;
    };

    // ក្បាលឯកសារ: merge C:F
    ws.getRow(1).height = 19.35;
    put(2, 3, 6, SCHOOL_KH, { name: F_MOUL, size: 12, bold: true });
    put(3, 3, 6, SCHOOL_EN, { name: 'Times New Roman', size: 16, bold: true });
    put(4, 3, 6, title, { name: F_MOUL, size: 12 });
    ws.getRow(5).height = 14.25;

    // ក្បាលតារាង (ជួរទី ៦) ពណ៌ខៀវ
    const hr = ws.getRow(6);
    hr.height = 30;
    head.forEach((h, i) => {
      const c = hr.getCell(i + 1);
      c.value = h; c.font = { name: F_MOUL, size: 11 };
      c.alignment = { ...ctr, wrapText: true }; c.border = bd;
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } };
    });

    // ទិន្នន័យ (ចាប់ពីជួរទី ៧)
    body.forEach((vals, i) => {
      const row = ws.getRow(7 + i);
      row.height = 29.25;
      vals.forEach((v, j) => {
        const c = row.getCell(j + 1);
        c.value = v;
        c.font = { name: F_BODY, size: j === 0 ? 9 : 10 };
        c.alignment = { horizontal: j === 1 ? 'left' : 'center', vertical: 'middle', wrapText: true };
        c.border = bd;
      });
    });

    // ហត្ថលេខា: ជួរឈរ G ដាក់កណ្តាល ក្រោមតារាងដាច់មួយជួរ
    const sig = 7 + body.length + 1;
    [[dateText, false], ['ហត្ថលេខា និង ឈ្មោះ', false], ['គ្រូបន្ទុកថ្នាក់', true]].forEach(([text, bold], i) => {
      const c = ws.getCell(sig + i, 7);
      c.value = text; c.font = { name: F_BODY, size: 11, bold }; c.alignment = ctr;
      ws.getRow(sig + i).height = 19.35;
    });

    const buf = await wb.xlsx.writeBuffer();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    a.download = `បញ្ជីឈ្មោះសិស្ស_${teacherName}${shiftName ? '_' + shiftName : ''}.xlsx`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  function exportPdf() {
    const { dateText, title, head, body } = exportInfo();
    const w = window.open('', '_blank');
    if (!w) return alert('Browser បានទប់ស្កាត់ផ្ទាំងថ្មី សូមអនុញ្ញាត Pop-up សិន');
    const rows = body.map(r => `<tr>${r.map((v, i) => `<td class="${i === 1 ? 'l' : ''}">${esc(String(v))}</td>`).join('')}</tr>`).join('');
    w.document.write(`<!DOCTYPE html><html lang="km"><head><meta charset="utf-8"><title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&display=swap" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 12mm; }
  body { font-family: 'Khmer OS Battambang','Battambang',sans-serif; font-size: 11px; color: #000; }
  .h { text-align: center; line-height: 1.9; }
  .moul { font-family: 'Khmer OS Moul Light','Moul',serif; font-size: 13px; }
  .en { font-family: 'Times New Roman',serif; font-size: 20px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #000; padding: 3px 5px; text-align: center; height: 26px; }
  th { background: #00B0F0; font-family: 'Khmer OS Moul Light','Moul',serif; font-weight: 400; font-size: 11px; }
  td.l { text-align: left; }
  tr { page-break-inside: avoid; }
  thead { display: table-header-group; }
  .sig { margin: 14px 0 0 60%; width: 40%; text-align: center; line-height: 1.9; font-size: 12px; page-break-inside: avoid; }
</style></head><body>
  <div class="h moul"><b>${SCHOOL_KH}</b></div>
  <div class="h en">${SCHOOL_EN}</div>
  <div class="h moul">${esc(title)}</div>
  <table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
  <div class="sig"><div>${dateText}</div><div>ហត្ថលេខា និង ឈ្មោះ</div><div><b>គ្រូបន្ទុកថ្នាក់</b></div></div>
  <script>document.fonts.ready.then(() => setTimeout(() => window.print(), 400));<\/script>
</body></html>`);
    w.document.close();
  }

  function exportData(type) {
    if (!visible().length) return alert('មិនមានទិន្នន័យសម្រាប់ទាញយកទេ');
    if (type === 'excel') exportExcel();
    else if (type === 'pdf') exportPdf();
  }
  // ---------- event (delegate លើ #rs_root) ----------
  function bindRoot() {
    const root = gid('rs_root');
    root.onclick = async e => {
      const sf = e.target.closest('[data-sf]');
      if (sf) { shiftF = sf.dataset.sf; const a = gid('rs_a_shift'); if (a && SHIFTS.includes(shiftF)) a.value = shiftF; return drawList(); }
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.dataset.a, id = b.dataset.id;
      if (a === 'edit') { editId = id; drawList(); }
      else if (a === 'cancel') { editId = null; drawList(); }
      else if (a === 'photo') {
        const r = rows.find(x => String(x.id) === String(id));
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'image/*';
        inp.onchange = async () => {
          const f = inp.files[0];
          if (!f || !r) return;
          try { await uploadPhoto(r.teacher_id, r.id, f, r.photo_path, T); } catch (err) { return fail('រូបថតមិនបានចូលទេ: ', err); }
          await loadRoster(); drawDyn();
        };
        inp.click();
      }
      else if (a === 'save') await save(id);
      else if (a === 'del') await del([id]);
      else if (a === 'restore') await restore(id);
      else if (a === 'exportExcel') exportData('excel');
      else if (a === 'exportPdf') exportData('pdf');
    };
    root.onchange = async e => {
      const t = e.target, d = t.dataset;
      if (d.s !== undefined) { t.checked ? sel.add(d.s) : sel.delete(d.s); drawList(); }
      else if (d.sh !== undefined) await setShift([d.sh], t.value);
      else if (t.id === 'rs_all') { visible().forEach(r => t.checked ? sel.add(String(r.id)) : sel.delete(String(r.id))); drawList(); }
      else if (t.id === 'rs_who') { who = t.value; sel.clear(); const a = gid('rs_a_t'); if (a) a.value = who; drawDyn(); }
      else if (t.id === 'rs_file') { const f = t.files[0]; t.value = ''; if (f) await importFile(f); }
    };
    root.oninput = e => {
      if (e.target.id === 'rs_q') { q = e.target.value; drawList(); }
    };
    root.onsubmit = async e => { e.preventDefault(); if (e.target.id === 'rs_add') await add(new FormData(e.target)); };
  }

  // ---------- ភ្ជាប់ចូល render() / load() របស់ app.js ----------
  const _render = window.render, _load = window.load;
  window.load = async function () { await _load(); await loadRoster(); };
  window.render = function () {
    const keep = {};
    document.querySelectorAll('#rs_root [id^="rs_a_"]:not([type="file"]), #rs_root [id^="rs_e_"]:not([type="file"])').forEach(el => { keep[el.id] = el.value; });
    _render();
    injectTab();
    if (activeTab !== 'roster') return;
    const main = document.querySelector('#app main');
    if (!main) return;
    main.innerHTML = shell();
    bindRoot();
    drawDyn();
    Object.keys(keep).forEach(id => { const el = gid(id); if (el) el.value = keep[id]; });
  };
  if (me && document.querySelector('#app nav')) loadRoster().then(() => render());
})();