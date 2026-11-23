// ===== roster.js · tab "បញ្ជីសិស្សថ្នាក់" (tab ទី ៣ នៅជួរជាមួយ ប្រចាំខែ / ប្រចាំត្រីមាស) =====
// ដាក់ក្រោម app.js ក្នុង index.html · តារាង Supabase: roster_students (ត្រូវមានជួរ shift — run roster-add-shift.sql ម្តង)
(() => {
  const T = 'roster_students';
  const SHIFTS = ['ព្រឹក', 'ថ្ងៃ', 'ល្ងាច'];
  const SHIFT_CLR = { 'ព្រឹក': 'bg-amber-100 text-amber-800', 'ថ្ងៃ': 'bg-sky-100 text-sky-800', 'ល្ងាច': 'bg-violet-100 text-violet-800' };
  const GENDER = v => { const s = String(v ?? '').trim(); return /^(ស្រី|ស|f|female)$/i.test(s) ? 'ស្រី' : /^(ប្រុស|ប|m|male)$/i.test(s) ? 'ប្រុស' : s; };
  const normShift = v => { const s = String(v ?? '').toLowerCase(); return /ព្រឹក|morning|am/.test(s) ? 'ព្រឹក' : /ល្ងាច|evening|night/.test(s) ? 'ល្ងាច' : /ថ្ងៃ|afternoon|noon/.test(s) ? 'ថ្ងៃ' : ''; };
  const gid = id => document.getElementById(id);
  const cb = 'cb checked:bg-brand checked:border-brand';
  const fail = (m, error) => alert(m + (error ? error.message : '') + (error && /shift|photo_path/i.test(error.message) ? '\n(ត្រូវ run roster-add-columns.sql ក្នុង Supabase ម្តងសិន ដើម្បីបន្ថែមជួរ "វេន" និង "រូបថត")' : ''));

  let rows = [], err = '', q = '', shiftF = '', who = '', editId = null, course = '';
  const sel = new Set(), unpick = new Set(), ranks = {};
  const target = () => (isAdmin() ? ((gid('rs_a_t') && gid('rs_a_t').value) || who) : me.id);
  const locked = async () => { if (!isAdmin() && await isLocked()) { alert(LOCK_MSG); return true; } return false; };
  const base = () => rows.filter(r => !who || r.teacher_id === who);
  const visible = () => {
    const nq = norm(q).toLowerCase();
    return base().filter(r => (!shiftF || (shiftF === '_' ? !r.shift : r.shift === shiftF))
      && (!nq || [r.name, r.village, r.phone, r.bus].some(v => norm(v).toLowerCase().includes(nq))));
  };
  const rankedList = () => rows.filter(r => ranks[r.id]);

  // ---------- រូបថត (bucket student-photos ដូចសិស្សប្រចាំខែ/ត្រីមាស) ----------
  async function loadRosterPhotos() {
    const now = Date.now();
    const need = [...new Set(rows.map(x => x.photo_path).filter(p => p && !(photoUrls[p] && photoUrls[p].exp > now + 600000)))];
    if (!need.length) return;
    const { data } = await sb.storage.from(PHOTO_BUCKET).createSignedUrls(need, 3600);
    (data || []).forEach(d => { if (d.signedUrl) photoUrls[d.path] = { url: d.signedUrl, exp: now + 3600000 }; });
  }
  // ចម្លងរូបទៅឈ្មោះថ្មី (កុំចែករូបតែមួយរវាងបញ្ជីថ្នាក់ និងសិស្ស ព្រោះលុបម្ខាងនឹងបាត់ម្ខាងទៀត)
  async function clonePhoto(src, tid) {
    const path = `${tid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await sb.storage.from(PHOTO_BUCKET).copy(src, path);
    return error ? null : path;
  }

  async function loadRoster() {
    if (!me) return;
    const ids = teachers.map(t => t.id);
    if (!ids.length) { rows = []; err = ''; return; }
    const { data, error } = await sb.from(T).select('*').in('teacher_id', ids);
    if (error) { err = error.message; rows = []; return; }
    err = '';
    rows = (data || []).sort((a, b) => tIndex(a.teacher_id) - tIndex(b.teacher_id) || a.id - b.id);
    const have = new Set(rows.map(r => String(r.id)));
    [...sel].forEach(i => { if (!have.has(i)) sel.delete(i); });
    Object.keys(ranks).forEach(i => { if (!have.has(i)) delete ranks[i]; });
    await loadRosterPhotos();
  }
  const reload = async () => { await loadRoster(); drawDyn(); };

  // ---------- tab ក្នុងរបារ ----------
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
    b.onclick = async () => { activeTab = 'roster'; editingId = null; selS.clear(); await loadRoster(); render(); };
  }

  // ---------- ស៊ុមទំព័រ (មិនប្តូរពេលស្វែងរក/ជ្រើស) ----------
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
        ${fld('រូបថត', `<input id="rs_a_photo" type="file" accept="image/*" class="${C.input} text-xs">`)}
        <button class="${C.btnAccent} sm:col-span-2 lg:col-span-3">បន្ថែមចូលបញ្ជីថ្នាក់</button>
      </form>

      <h2 class="font-bold text-brand text-base sm:text-lg mt-8 mb-3 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>បញ្ជីសិស្សថ្នាក់</h2>
      <div class="${C.card} p-4 mb-3 grid gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <input id="rs_q" type="search" value="${esc(q)}" placeholder="ស្វែងរកសិស្ស (ឈ្មោះ ភូមិ លេខទូរសព្ទ ឡាន)" class="${C.input} flex-1 min-w-[14rem]">
          ${isAdmin() ? `<select id="rs_who" class="${C.input} max-w-xs"><option value="">គ្រូទាំងអស់</option>${tOpts(who)}</select>` : ''}
          <label class="${C.ghost} cursor-pointer">នាំចូលពី Excel<input id="rs_file" type="file" accept=".xlsx,.xls,.csv" class="hidden"></label>
        </div>
        <div id="rs_pills" class="flex flex-wrap gap-2"></div>
      </div>
      <div id="rs_bulk"></div>
      <div id="rs_table"></div>

      <h2 class="font-bold text-brand text-base sm:text-lg mt-8 mb-1 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>បញ្ចូលទៅប្រចាំខែ / ប្រចាំត្រីមាស</h2>
      <p class="text-sm text-slate-500 mb-3 px-1">ជ្រើសចំណាត់ថ្នាក់ក្នុងជួរសិស្សនីមួយៗខាងលើ សិស្សនោះនឹងមកនៅទីនេះជាក្រុមតាមចំណាត់ថ្នាក់។ ធីកអ្នកដែលត្រូវបញ្ចូល រួចចុចប៊ូតុងតែម្តង។</p>
      <div id="rs_ranked"></div>
    </div>`;
  }

  // ---------- ផ្នែកដែលប្តូរតាមស្ថានភាព ----------
  function drawDyn() { if (!gid('rs_root')) return; drawList(); drawRanked(); }

  function drawList() {
    const vis = visible(), b = base();
    gid('rs_stats').innerHTML =
      stat('សិស្សក្នុងបញ្ជី', rows.length, 'bg-brand') +
      stat('កំពុងបង្ហាញ', vis.length, 'bg-emerald-500') +
      stat('បានដាក់ចំណាត់ថ្នាក់', rankedList().length, 'bg-accent');

    const cnt = s => b.filter(r => s === '' ? true : s === '_' ? !r.shift : r.shift === s).length;
    const pill = (v, label) => (v === '_' && !cnt(v) && shiftF !== '_') ? '' :
      `<button type="button" data-sf="${v}" class="px-4 py-1.5 rounded-full text-sm font-semibold border transition ${shiftF === v ? 'bg-brand text-white border-brand shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">${label} <span class="${shiftF === v ? 'text-white/80' : 'text-slate-400'} text-xs">${khNum(cnt(v))}</span></button>`;
    gid('rs_pills').innerHTML = pill('', 'ទាំងអស់') + SHIFTS.map(s => pill(s, 'វេន' + s)).join('') + pill('_', 'មិនទាន់កំណត់វេន');

    gid('rs_bulk').innerHTML = sel.size ? `<div class="flex flex-wrap items-center gap-3 mb-3 px-4 py-3 rounded-xl bg-brand/5 border border-brand/20">
      <span class="text-sm font-semibold text-brand">បានជ្រើស ${khNum(sel.size)} នាក់</span>
      <select id="rs_bulk_rank" class="${C.input} !w-auto"><option value="">ដាក់ចំណាត់ថ្នាក់ទាំងអស់</option>${CLASS_RANKS.map(k => `<option value="${k}">ចំណាត់ថ្នាក់ ${k}</option>`).join('')}</select>
      <select id="rs_bulk_shift" class="${C.input} !w-auto"><option value="">ដាក់វេនទាំងអស់</option>${SHIFTS.map(s => `<option value="${s}">វេន${s}</option>`).join('')}<option value="_">លុបវេន</option></select>
      <span class="flex-1"></span>
      <button type="button" data-a="delsel" class="${C.del} !py-2.5">លុបដែលបានជ្រើស</button>
      <button type="button" data-a="clrsel" class="${C.cancel} !py-2.5">បោះបង់ការជ្រើស</button></div>` : '';

    const admin = isAdmin();
    const heads = ['ល.រ', 'ឈ្មោះ', 'ភេទ', 'ភូមិ', 'ថ្ងៃខែឆ្នាំកំណើត', 'លេខទូរសព្ទ', 'ថ្ងៃចូលរៀន', 'ឡាន', 'វេន', ...(admin ? ['គ្រូ'] : []), 'ចំណាត់ថ្នាក់', 'សកម្មភាព'];
    const view = (r, i) => `<tr class="${ranks[r.id] ? 'bg-brand/5' : 'bg-white'} hover:bg-brand/10 transition ${admin && i > 0 && vis[i - 1].teacher_id !== r.teacher_id ? 'border-t-2 border-slate-300' : ''}">
      ${td('ជ្រើស', `<input type="checkbox" class="${cb}" data-s="${r.id}" ${sel.has(String(r.id)) ? 'checked' : ''}>`)}
      ${td('ល.រ', khNum(i + 1))}
      ${td('ឈ្មោះ', `<div class="flex items-center gap-3">${photoCell(r)}<span>${esc(r.name)}</span></div>`, 'font-medium')}
      ${td('ភេទ', esc(r.gender))}
      ${td('ភូមិ', esc(r.village))}
      ${td('ថ្ងៃខែឆ្នាំកំណើត', esc(formatKhmerDate(r.dob)))}
      ${td('លេខទូរសព្ទ', esc(r.phone))}
      ${td('ថ្ងៃចូលរៀន', esc(formatKhmerDate(r.enrolled_at)))}
      ${td('ឡាន', esc(r.bus))}
      ${td('វេន', `<select data-sh="${r.id}" class="${C.input} !w-28">${shiftOpts(r.shift)}</select>`)}
      ${admin ? td('គ្រូ', teacherPill(r.teacher_id)) : ''}
      ${td('ចំណាត់ថ្នាក់', `<select data-rk="${r.id}" class="${C.input} !w-24"><option value="">—</option>${CLASS_RANKS.map(k => `<option ${ranks[r.id] === k ? 'selected' : ''}>${k}</option>`).join('')}</select>`)}
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
      ${admin ? td('គ្រូ', teacherPill(r.teacher_id)) : ''}${td('ចំណាត់ថ្នាក់', '')}
      ${td('សកម្មភាព', `<button type="button" data-a="save" data-id="${r.id}" class="${C.save}">រក្សាទុក</button> <button type="button" data-a="cancel" class="${C.cancel}">បោះបង់</button>`, 'whitespace-nowrap')}
    </tr>`;

    gid('rs_table').innerHTML = vis.length
      ? `<label class="inline-flex items-center gap-2 text-sm text-slate-600 mb-3 px-1 cursor-pointer"><input type="checkbox" id="rs_all" class="${cb}" ${vis.every(r => sel.has(String(r.id))) ? 'checked' : ''}> ជ្រើសទាំងអស់ដែលកំពុងបង្ហាញ (${khNum(vis.length)})</label>
        <div class="${C.card} overflow-hidden"><div class="overflow-x-auto"><table class="w-full border-collapse responsive-table">
          <thead><tr><th class="${C.th} w-10"></th>${heads.map(h => `<th class="${C.th}">${h}</th>`).join('')}</tr></thead>
          <tbody>${vis.map((r, i) => String(r.id) === String(editId) ? edit(r, i) : view(r, i)).join('')}</tbody></table></div></div>`
      : `<div class="${C.card} p-12 text-center text-slate-500">${rows.length ? 'រកមិនឃើញសិស្សតាមការស្វែងរក ឬវេនដែលបានជ្រើសទេ។' : 'មិនទាន់មានសិស្សក្នុងបញ្ជីទេ។ បន្ថែមដោយដៃខាងលើ ឬនាំចូលពី Excel។'}</div>`;
  }

  function drawRanked() {
    const list = rankedList();
    if (!list.length) {
      gid('rs_ranked').innerHTML = `<div class="${C.card} p-8 text-center text-slate-500 text-sm">មិនទាន់មានសិស្សដែលបានដាក់ចំណាត់ថ្នាក់ទេ។ ជ្រើសចំណាត់ថ្នាក់ក្នុងជួរសិស្សខាងលើ។</div>`;
      return;
    }
    const picked = list.filter(r => !unpick.has(String(r.id)));
    const chip = r => `<label class="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-2.5 pr-3 py-1 text-sm cursor-pointer hover:bg-slate-50">
      <input type="checkbox" class="${cb}" data-pk="${r.id}" ${unpick.has(String(r.id)) ? '' : 'checked'}>
      ${photoCell(r, 'w-7 h-7', false)}
      <span>${esc(r.name)}</span>
      ${r.shift ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold ${SHIFT_CLR[r.shift] || ''}">${esc(r.shift)}</span>` : ''}
      ${isAdmin() ? `<span class="text-xs text-slate-400">${esc(tname(r.teacher_id))}</span>` : ''}</label>`;
    gid('rs_ranked').innerHTML = `<div class="${C.card} p-4">
      <div class="flex flex-wrap items-center gap-2 mb-1">
        <h3 class="font-bold text-brand flex-1 min-w-[12rem]">សិស្សដែលបានដាក់ចំណាត់ថ្នាក់ (${khNum(list.length)} នាក់)</h3>
        <button type="button" data-a="pickall" class="${C.edit}">ជ្រើសទាំងអស់</button>
        <button type="button" data-a="pickno" class="${C.edit}">ដកទាំងអស់</button>
        <button type="button" data-a="clrranks" class="${C.del}">លុបចំណាត់ថ្នាក់ទាំងអស់</button></div>
      ${CLASS_RANKS.map(k => { const g = list.filter(r => ranks[r.id] === k); return g.length ? `<div class="flex items-start gap-3 py-3 border-t border-slate-100">
        <div class="w-28 flex-none pt-1 flex items-center gap-2">${rankBadge(k)}<span class="text-xs text-slate-500">${khNum(g.length)} នាក់</span></div>
        <div class="flex flex-wrap gap-2">${g.map(chip).join('')}</div></div>` : ''; }).join('')}
      <div class="flex flex-wrap items-center gap-3 mt-2 pt-4 border-t border-slate-200">
        <span class="text-sm font-semibold text-brand flex-1 min-w-[10rem]">នឹងបញ្ចូល ${khNum(picked.length)} នាក់</span>
        <input id="rs_course" list="rs_cl" value="${esc(course)}" placeholder="វគ្គសិក្សា (សម្រាប់ប្រចាំត្រីមាស)" class="${C.input} max-w-xs">
        <datalist id="rs_cl">${COURSES.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
        <button type="button" data-a="pm" class="${C.btnAccent}">បញ្ចូលទៅប្រចាំខែ</button>
        <button type="button" data-a="pq" class="${C.btn}">បញ្ចូលទៅប្រចាំត្រីមាស</button></div></div>`;
  }

  // ---------- សកម្មភាព ----------
  async function add(fd) {
    const tid = target();
    if (!tid) return alert('សូមជ្រើសគ្រូជាមុន');
    const g = k => String(fd.get(k) ?? '').trim(), name = cleanName(g('name'));
    if (!name) return;
    if (rows.some(r => r.teacher_id === tid && norm(r.name) === norm(name))) return alert('សិស្សនេះមានក្នុងបញ្ជីរួចហើយ');
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

  async function del(ids) {
    if (!ids.length) return alert('សូមជ្រើសសិស្សជាមុន');
    if (!confirm(`លុបសិស្ស ${ids.length} នាក់ចេញពីបញ្ជីថ្នាក់? (មិនប៉ះពាល់ទិន្នន័យប្រចាំខែ/ត្រីមាសទេ)`)) return;
    const gone = new Set(ids.map(String)), paths = rows.filter(r => gone.has(String(r.id)) && r.photo_path).map(r => r.photo_path);
    const { error } = await sb.from(T).delete().in('id', ids);
    if (error) return alert(error.message);
    if (paths.length) sb.storage.from(PHOTO_BUCKET).remove(paths);
    ids.forEach(i => { sel.delete(String(i)); delete ranks[i]; });
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
      const seen = new Set(rows.map(r => r.teacher_id + '|' + norm(r.name)));
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

  // បញ្ចូលសិស្សដែលមានចំណាត់ថ្នាក់ទៅប្រចាំខែ ឬប្រចាំត្រីមាស (សិស្សដែលមានរួចហើយ៖ កែតែចំណាត់ថ្នាក់)
  async function push(dest) {
    if (await locked()) return;
    const list = rankedList().filter(r => !unpick.has(String(r.id)));
    if (!list.length) return alert('សូមដាក់ចំណាត់ថ្នាក់ និងធីកសិស្សយ៉ាងហោចណាស់ម្នាក់');
    const quarterly = dest === 'quarterly', cs = (gid('rs_course') ? gid('rs_course').value : course).trim();
    const have = new Map((quarterly ? students : monthlyStudents).map(s => [s.teacher_id + '|' + norm(s.name), s]));
    const plan = [];   // { r, ex, k }
    list.forEach(r => {
      const key = r.teacher_id + '|' + norm(r.name), ex = have.get(key), k = ranks[r.id];
      if (ex && plan.some(p => p.key === key)) return;
      plan.push({ r, ex, k, key });
      if (!ex) have.set(key, { class_no: k, course: cs, photo_path: 'x' });
    });
    // ចម្លងរូបថតទៅសិស្សថ្មី (ឬសិស្សដែលមានរួចតែគ្មានរូប) · ម្តង ៦ រូប
    const need = plan.filter(p => p.r.photo_path && (!p.ex || !p.ex.photo_path));
    const cloned = new Map(); let phFail = 0;
    const q2 = need.slice();
    await Promise.all(Array.from({ length: 6 }, async () => {
      while (q2.length) {
        const p = q2.shift(), np = await clonePhoto(p.r.photo_path, p.r.teacher_id);
        if (np) cloned.set(p.r.id, np); else phFail++;
      }
    }));
    const add = [], upd = []; let same = 0;
    plan.forEach(({ r, ex, k }) => {
      const ph = cloned.get(r.id);
      if (!ex) {
        const row = quarterly ? { teacher_id: r.teacher_id, name: r.name, gender: r.gender, class_no: k, dob: r.dob, course: cs } : { teacher_id: r.teacher_id, name: r.name, class_no: k };
        if (ph) row.photo_path = ph;
        add.push(row);
      } else {
        const patch = {};
        if (ex.class_no !== k) patch.class_no = k;
        if (quarterly && cs && ex.course !== cs) patch.course = cs;
        if (ph) patch.photo_path = ph;
        if (Object.keys(patch).length) upd.push({ id: ex.id, patch }); else same++;
      }
    });
    const table = quarterly ? 'students' : 'monthly_students';
    for (let i = 0; i < add.length; i += 200) {
      const { error } = await sb.from(table).insert(add.slice(i, i + 200));
      if (error) return alert('បញ្ចូលមិនបានទេ: ' + error.message);
    }
    for (const u of upd) {
      const { error } = await sb.from(table).update(u.patch).eq('id', u.id);
      if (error) return alert('កែចំណាត់ថ្នាក់មិនបានទេ: ' + error.message);
    }
    list.forEach(r => { delete ranks[r.id]; unpick.delete(String(r.id)); });
    sel.clear(); selS.clear(); activeTab = dest;
    await load(); render();
    alert(`បញ្ចូលបាន ${add.length} នាក់ទៅ${quarterly ? 'ប្រចាំត្រីមាស' : 'ប្រចាំខែ'}`
      + (cloned.size ? `\nរូបថតដែលបានទៅជាមួយ: ${cloned.size}` : '') + (phFail ? `\nរូបថតចម្លងមិនបាន: ${phFail}` : '')
      + (upd.length ? `\nកែសិស្សដែលមានរួច: ${upd.length}` : '') + (same ? `\nមានរួចហើយ គ្មានអ្វីប្តូរ: ${same}` : ''));
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
      else if (a === 'delsel') await del([...sel]);
      else if (a === 'clrsel') { sel.clear(); drawList(); }
      else if (a === 'pickall') { unpick.clear(); drawRanked(); }
      else if (a === 'pickno') { rankedList().forEach(r => unpick.add(String(r.id))); drawRanked(); }
      else if (a === 'clrranks') { Object.keys(ranks).forEach(k => delete ranks[k]); unpick.clear(); drawDyn(); }
      else if (a === 'pm') await push('monthly');
      else if (a === 'pq') await push('quarterly');
    };
    root.onchange = async e => {
      const t = e.target, d = t.dataset;
      if (d.s !== undefined) { t.checked ? sel.add(d.s) : sel.delete(d.s); drawList(); }
      else if (d.rk !== undefined) { t.value ? ranks[d.rk] = t.value : delete ranks[d.rk]; drawDyn(); }
      else if (d.sh !== undefined) await setShift([d.sh], t.value);
      else if (d.pk !== undefined) { t.checked ? unpick.delete(d.pk) : unpick.add(d.pk); drawRanked(); }
      else if (t.id === 'rs_all') { visible().forEach(r => t.checked ? sel.add(String(r.id)) : sel.delete(String(r.id))); drawList(); }
      else if (t.id === 'rs_who') { who = t.value; sel.clear(); const a = gid('rs_a_t'); if (a) a.value = who; drawDyn(); }
      else if (t.id === 'rs_bulk_rank') { if (t.value) { sel.forEach(i => { ranks[i] = t.value; }); drawDyn(); } }
      else if (t.id === 'rs_bulk_shift') { if (t.value) await setShift([...sel], t.value === '_' ? '' : t.value); }
      else if (t.id === 'rs_file') { const f = t.files[0]; t.value = ''; if (f) await importFile(f); }
    };
    root.oninput = e => {
      if (e.target.id === 'rs_q') { q = e.target.value; drawList(); }
      else if (e.target.id === 'rs_course') course = e.target.value;
    };
    root.onsubmit = async e => { e.preventDefault(); if (e.target.id === 'rs_add') await add(new FormData(e.target)); };
  }

  // ---------- ភ្ជាប់ចូល render() / load() របស់ app.js ----------
  const _render = window.render, _load = window.load;
  window.load = async function () { await _load(); await loadRoster(); };
  window.render = function () {
    // រក្សាអ្វីដែលកំពុងវាយក្នុងទម្រង់បន្ថែម/កែ (ពេល auto reload)
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
  // បើ app.js render រួចមុន roster.js ផ្ទុកចប់
  if (me && document.querySelector('#app nav')) loadRoster().then(() => render());
})();
