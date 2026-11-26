// ===== results.js · tab "តារាងលទ្ធផល" និង "តារាងកិត្តិយស" =====
// ដាក់ក្នុង index.html បន្ទាប់ពី roster.js:  <script src="results.js"></script>
(() => {
  const T_STU = 'roster_students', T_SC = 'roster_scores';
  const SHIFTS = ['ព្រឹក', 'ថ្ងៃ', 'ល្ងាច'];
  const KH_M = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  const SCHOOL_KH = 'សាលាអន្តរទ្វីប ខូស្បេស៍';
  const SCHOOL_EN = 'Co Space Intercon School';
  const F_MOUL = 'Khmer OS Moul Light', F_BODY = 'Khmer OS Battambang';
  const gid = id => document.getElementById(id);
  const NDT = 'គ្មានទិន្នន័យ';
  const ND = `<span class="rx-nd">${NDT}</span>`;

  // ---------- ទម្រង់តារាងពីរ (តាម B1 PM និង B3 Night) ----------
  const FORMATS = {
    kh_en: {
      label: 'ខ្មែរ / អង់គ្លេស (ដូច B1 PM)',
      subjects: [
        { k: 'en', l: 'អង់គ្លេស', max: 100 }, { k: 'kh', l: 'ខ្មែរ', max: 100 }, { k: 'math', l: 'គណិត', max: 100 }, { k: 'com', l: 'កុំព្យូទ័រ', max: 100 },
        { k: 'week', l: 'សប្តាហ៍', max: 40 }, { k: 'beh', l: 'ឥរិយាបថ', max: 10 }, { k: 'att', l: 'វត្តមាន', max: 10 }
      ]
    },
    en_com: {
      label: 'អង់គ្លេស / កុំព្យូទ័រ (ដូច B3 Night)',
      subjects: [
        { k: 'en', l: 'អង់គ្លេស', max: 100 }, { k: 'com', l: 'កុំព្យូទ័រ', max: 25 },
        { k: 'week', l: 'សប្តាហ៍', max: 40 }, { k: 'beh', l: 'ឥរិយាបថ', max: 10 }, { k: 'att', l: 'វត្តមាន', max: 10 }
      ]
    }
  };
  const maxOf = F => F.subjects.reduce((a, s) => a + s.max, 0);

  // ---------- រូបមន្តគណនា ----------
  // មធ្យម = សរុប ÷ ផលបូក 'max' នៃមុខវិជ្ជាដែលមានពិន្ទុ × 100 (២ខ្ទង់) · max មិនបង្ហាញ និងមិនបង្ខំពិន្ទុទេ ប្រើសម្រាប់គណនាមធ្យមប៉ុណ្ណោះ · និទ្ទេស: A≥90 B≥80 C≥70 D≥60 E≥50 F<50
  const num = v => { if (v === '' || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
  const gradeOf = a => a >= 90 ? 'A' : a >= 80 ? 'B' : a >= 70 ? 'C' : a >= 60 ? 'D' : a >= 50 ? 'E' : 'F';
  function calc(fk, sc) {
    const F = FORMATS[fk];
    const vals = F.subjects.map(s => num(sc && sc[s.k]));
    const has = vals.some(v => v !== null);
    if (!has) return { has: false, total: null, avg: null, grade: '' };
    const total = vals.reduce((a, v) => a + (v || 0), 0);
    // ចែកតែតាមមុខវិជ្ជាដែលបានបញ្ចូលពិន្ទុ (មុខវិជ្ជាទំនេរមិនយកមកគិត) ដូច្នេះបន្ថែមកុំព្យូទ័រមិនប៉ះពាល់សិស្សដែលគ្មានពិន្ទុកុំព្យូទ័រ
    const max = F.subjects.reduce((a, s, i) => a + (vals[i] !== null ? s.max : 0), 0);
    const avg = Math.round(total / max * 10000) / 100;
    return { has: true, total, max, avg, grade: gradeOf(avg) };
  }
  // ចំណាត់ថ្នាក់បែប RANK របស់ Excel: ពិន្ទុស្មើគ្នាបានចំណាត់ថ្នាក់ដូចគ្នា (1,2,2,4)
  const rankOf = totals => totals.map(t => t === null ? null : 1 + totals.filter(x => x !== null && x > t).length);
  const GRADE_CLR = { A: 'FF0000', B: 'FF66CC', C: 'FFC000', D: '0070C0', E: '00B050', F: 'FF0000' };
  const gradeClr = (fk, g) => fk === 'kh_en' ? 'FF0000' : (GRADE_CLR[g] || '000000');
  const sexShort = g => /ស្រី|^ស$/.test(g || '') ? 'ស' : /ប្រុស|^ប$/.test(g || '') ? 'ប' : (g || '');

  // ---------- CSS (ដាក់ដោយខ្លួនឯង មិនពឹងលើ tailwind.css) ----------
  const st = document.createElement('style');
  st.textContent = `
    .rx-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
    .rx-wrap{overflow-x:auto}
    .rx-tbl{border-collapse:collapse;width:100%;min-width:760px}
    .rx-tbl th,.rx-tbl td{border:1px solid #e2e8f0;padding:6px 8px;text-align:center;font-size:14px}
    .rx-tbl th{background:#FFC000;color:#1e293b;font-weight:700}
    .rx-tbl td.l{text-align:left;white-space:nowrap}
    .rx-sc{width:68px;text-align:center;padding:6px 4px;border:1px solid #cbd5e1;border-radius:8px;background:#fff}
    .rx-sc.bad{border-color:#dc2626;background:#fef2f2}
    .rx-act{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:12px 0}
    .rx-honor{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
    .rx-hc{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px}
    .rx-hr{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #f1f5f9}
    .rx-medal{width:34px;text-align:center;font-size:22px;flex:none}
    .rx-gr{font-weight:700;font-size:18px;margin-left:auto}
    .rx-nd{color:#94a3b8!important;font-size:12px!important;font-weight:400!important;white-space:nowrap}`;
  document.head.appendChild(st);

  // ---------- state ----------
  let tid = '', shift = '', month = new Date().getMonth(), year = new Date().getFullYear();
  let fmt = 'kh_en', level = '', sub = '';
  let students = [], stuFor = '', entry = new Map(), raw = new Map(), had = new Set();
  let dirty = false, loadedKey = '', lastErr = '';
  let hTid = '', hTop = 3, hKey = '', hData = null, hErr = '';
  let started = false;
  // ត្រីមាស/ឆមាស/ឆ្នាំ
  const VIEWS = { month: 'ប្រចាំខែ', q1: 'ត្រីមាសទី១', q2: 'ត្រីមាសទី២', s1: 'ឆមាសទី១', q3: 'ត្រីមាសទី៣', q4: 'ត្រីមាសទី៤', s2: 'ឆមាសទី២', year: 'ប្រចាំឆ្នាំ' };
  const CHILD = { s1: ['q1', 'q2'], s2: ['q3', 'q4'], year: ['s1', 's2'] };
  const R2 = x => Math.round(x * 100) / 100;
  let view = 'month', allRaw = new Map();
  let syStart = 7; try { syStart = Number(localStorage.getItem('csi_res_sm')) || 7; } catch (e) { /* ignore */ }
  let sy = (new Date().getMonth() + 1) >= syStart ? year : year - 1;   // ឆ្នាំចាប់ផ្តើមឆ្នាំសិក្សា
  const curKey = () => `${typeof me !== 'undefined' && me && !isAdmin() ? me.id : tid}|${view}|${year}|${month}|${sy}|${syStart}`;

  const teacherIds = () => (typeof teachers !== 'undefined' && teachers ? teachers.map(t => t.id) : []);
  const hint = e => /roster_scores|relation|schema cache|does not exist/i.test((e && e.message) || '') ? '\n(ត្រូវ run roster-scores.sql ក្នុង Supabase ម្តងសិន)' : '';
  const fld = (l, html) => `<label class="grid gap-1 text-xs font-semibold text-slate-500">${l}${html}</label>`;
  const visibleStu = () => students.filter(s => shift === '_' ? !s.shift : s.shift === shift);
  const entryOf = s => entry.get(String(s.id)) || {};

  // ---------- ការចងចាំការកំណត់ក្នុងថ្នាក់ (ទម្រង់ / កម្រិត / ចំណងជើងរង) ----------
  const prefKey = () => `csi_res_${tid}_${shift}`;
  const readPref = () => { try { return JSON.parse(localStorage.getItem(prefKey()) || '{}'); } catch (e) { return {}; } };
  const savePref = () => {
    try { localStorage.setItem(prefKey(), JSON.stringify({ fmt, level, sub })); } catch (e) { /* ignore */ }
    const sh = shift === '_' ? '' : shift, row = { teacher_id: tid, shift: sh, fmt, level: level || '', subtitle: sub || '' };
    dbPref.set(`${tid}|${sh}`, row);
    try { Promise.resolve(sb.from('roster_class_settings').upsert(row, { onConflict: 'teacher_id,shift' })).catch(() => {}); } catch (e) { /* ignore */ }
  };
  const dbPref = new Map();   // `${tid}|${shift}` -> {fmt, level, subtitle}
  async function loadDbPref() {
    try { const { data } = await sb.from('roster_class_settings').select('*'); dbPref.clear(); (data || []).forEach(r => dbPref.set(`${r.teacher_id}|${r.shift || ''}`, r)); } catch (e) { /* table missing */ }
  }
  function applyClass() {
    const d = dbPref.get(`${tid}|${shift === '_' ? '' : shift}`);
    const p = d ? { fmt: d.fmt, level: d.level, sub: d.subtitle } : readPref();
    fmt = FORMATS[p.fmt] ? p.fmt : 'kh_en'; level = p.level || ''; sub = p.sub || '';
    const hit = visibleStu().map(s => raw.get(String(s.id))).find(x => x && FORMATS[x.fmt]);
    if (hit) fmt = hit.fmt;
  }

  // ---------- ទាញទិន្នន័យ ----------
  async function fetchAll(build) {
    const out = [];
    for (let i = 0; ; i += 1000) {
      const { data, error } = await build().range(i, i + 999);
      if (error) throw error;
      out.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    return out;
  }
  async function fetchScores(ids) {
    const out = [];
    for (let i = 0; i < ids.length; i += 150) {
      const { data, error } = await sb.from(T_SC).select('student_id,scores').eq('year', year).eq('month', month + 1).in('student_id', ids.slice(i, i + 150));
      if (error) throw error;
      out.push(...(data || []));
    }
    return out;
  }
  const stuSelect = () => sb.from(T_STU).select('*');
  const activeOnly = list => list.filter(x => !x.deleted_at);   // មិនយកសិស្សដែលបានលុប

  function ensureTid() {
    if (!isAdmin()) { tid = me.id; return; }
    const ids = teacherIds().map(String);
    if (!tid || !ids.includes(String(tid))) tid = ids[0] || '';
  }

  async function fetchYear(ids) {
    const out = [];
    for (let i = 0; i < ids.length; i += 100) {
      const part = await fetchAll(() => sb.from(T_SC).select('student_id,year,month,scores').in('year', [sy, sy + 1]).in('student_id', ids.slice(i, i + 100)).order('id'));
      out.push(...part);
    }
    return out;
  }

  async function loadResults(refetchStudents) {
    if (typeof me === 'undefined' || !me) return;
    ensureTid();
    try {
      lastErr = '';
      entry = new Map(); raw = new Map(); had = new Set(); allRaw = new Map();
      if (!tid) { students = []; }
      else {
        if (refetchStudents || stuFor !== String(tid)) {
          students = activeOnly(await fetchAll(() => stuSelect().eq('teacher_id', tid).order('id')));
          stuFor = String(tid);
        }
        if (view === 'month') {
          const sc = await fetchScores(students.map(s => s.id));
          sc.forEach(r => {
            const sid = String(r.student_id), o = r.scores || {}, e = {};
            Object.keys(o).forEach(k => { if (k !== 'fmt') e[k] = String(o[k]); });
            raw.set(sid, o); entry.set(sid, e); had.add(sid);
          });
        } else {
          const sc = await fetchYear(students.map(s => s.id));
          sc.forEach(r => allRaw.set(`${r.student_id}|${r.year}|${r.month}`, r.scores || {}));
        }
      }
      if (!shift || (shift !== '_' && !SHIFTS.includes(shift))) {
        shift = [...SHIFTS, '_'].find(s => students.some(x => s === '_' ? !x.shift : x.shift === s)) || 'ព្រឹក';
      }
      await loadDbPref();
      applyClass();
      dirty = false; loadedKey = curKey();
    } catch (e) { lastErr = e.message + hint(e); students = []; entry = new Map(); raw = new Map(); had = new Set(); allRaw = new Map(); loadedKey = ''; }
    drawResults();
  }

  // ---------- គណនាត្រីមាស / ឆមាស / ឆ្នាំ (យកតែមធ្យមភាគ) ----------
  function monthSeq() { const o = []; for (let i = 0; i < 12; i++) { const k = syStart - 1 + i; o.push({ y: sy + (k >= 12 ? 1 : 0), m: (k % 12) + 1 }); } return o; }
  function monthAvg(sid, y, m) {
    const sc = allRaw.get(`${sid}|${y}|${m}`); if (!sc) return null;
    const c = calc(FORMATS[sc.fmt] ? sc.fmt : fmt, sc); return c.has ? c.avg : null;
  }
  // បើខែ/ត្រីមាស/ឆមាសណាមិនទាន់គ្រប់ ទុកចន្លោះ (null) ហើយសរុប/មធ្យម/ចំណាត់ថ្នាក់/និទ្ទេស ទទេ
  function combine(vals) {
    if (vals.some(v => v === null)) return { vals, total: null, avg: null };
    const total = R2(vals.reduce((a, v) => a + v, 0));
    return { vals, total, avg: R2(total / vals.length) };
  }
  function nodeVal(sid, key) {
    if (key[0] === 'q') {
      const qi = Number(key[1]) - 1;
      return combine(monthSeq().slice(qi * 3, qi * 3 + 3).map(x => monthAvg(sid, x.y, x.m)));
    }
    return combine(CHILD[key].map(k => nodeVal(sid, k).avg));
  }
  function periodData() {
    const vis = visibleStu();
    const heads = view[0] === 'q'
      ? monthSeq().slice((Number(view[1]) - 1) * 3, (Number(view[1]) - 1) * 3 + 3).map(x => `ម.ធ ខែ${khNum(x.m)}`)
      : CHILD[view].map(k => `ម.ធ ${VIEWS[k]}`);
    const nodes = vis.map(s => nodeVal(String(s.id), view));
    const rk = rankOf(nodes.map(n => n.total));
    const rows = vis.map((s, i) => ({ s, vals: nodes[i].vals, n: heads.length, rank: rk[i],
      c: { has: nodes[i].total !== null, total: nodes[i].total, avg: nodes[i].avg, grade: nodes[i].avg !== null ? gradeOf(nodes[i].avg) : '' } }));
    return { heads, rows };
  }

  // ---------- Tab ក្នុងរបារ ----------
  function injectTabs() {
    const nav = document.querySelector('#app nav > div');
    if (!nav) return;
    ['tab-monthly', 'tab-quarterly'].forEach(id => { const b = gid(id); if (b) b.style.display = 'none'; });
    const mk = (id, label, key, after) => {
      let b = gid(id);
      if (!b) {
        b = document.createElement('button');
        b.id = id; b.textContent = label;
        b.className = 'px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap flex-none';
        if (after) after.after(b); else nav.prepend(b);
      }
      const on = activeTab === key;
      C.tabActive.split(' ').forEach(c => b.classList.toggle(c, on));
      C.tabInactive.split(' ').forEach(c => b.classList.toggle(c, !on));
      b.onclick = () => { activeTab = key; editingId = null; try { selS.clear(); } catch (e) { /* ignore */ } render(); };
      return b;
    };
    const r = mk('tab-results', 'តារាងលទ្ធផល', 'results', gid('tab-roster'));
    mk('tab-honor', 'តារាងកិត្តិយស', 'honor', r);
  }

  // =====================================================================
  //  តារាងលទ្ធផល
  // =====================================================================
  function shellResults() {
    return `<div id="rx_root">
      <h2 class="font-bold text-brand text-base sm:text-lg mb-3 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>តារាងលទ្ធផលប្រចាំខែ</h2>
      <div id="rx_err"></div>
      <div id="rx_filters" class="${C.card} p-4 mb-3"></div>
      <div id="rx_table"></div>
    </div>`;
  }

  function drawResults() {
    if (!gid('rx_root')) return;
    gid('rx_err').innerHTML = lastErr ? `<div class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">មិនអាចទាញទិន្នន័យបានទេ៖ ${esc(lastErr)}</div>` : '';
    drawFilters(); drawTable();
  }

  function drawFilters() {
    const cnt = s => students.filter(x => s === '_' ? !x.shift : x.shift === s).length;
    const shiftOpts = SHIFTS.map(s => `<option value="${s}" ${shift === s ? 'selected' : ''}>វេន${s} (${khNum(cnt(s))})</option>`).join('')
      + ((cnt('_') || shift === '_') ? `<option value="_" ${shift === '_' ? 'selected' : ''}>មិនទាន់កំណត់វេន (${khNum(cnt('_'))})</option>` : '');
    const monthOpts = KH_M.map((m, i) => `<option value="${i}" ${month === i ? 'selected' : ''}>ខែ${m}</option>`).join('');
    const fmtOpts = Object.keys(FORMATS).map(k => `<option value="${k}" ${fmt === k ? 'selected' : ''}>${FORMATS[k].label}</option>`).join('');
    const viewOpts = Object.keys(VIEWS).map(k => `<option value="${k}" ${view === k ? 'selected' : ''}>${k === 'month' ? 'ប្រចាំខែ (បញ្ចូលពិន្ទុ)' : VIEWS[k]}</option>`).join('');
    const startOpts = KH_M.map((m, i) => `<option value="${i + 1}" ${syStart === i + 1 ? 'selected' : ''}>ខែ${m}</option>`).join('');
    gid('rx_filters').innerHTML = `<div class="rx-bar">
      ${isAdmin() ? fld('គ្រូ', `<select id="rx_t" class="${C.input}">${tOpts(tid)}</select>`) : ''}
      ${fld('វេន', `<select id="rx_s" class="${C.input}">${shiftOpts}</select>`)}
      ${fld('តារាង', `<select id="rx_v" class="${C.input}">${viewOpts}</select>`)}
      ${view === 'month'
        ? fld('ខែ', `<select id="rx_m" class="${C.input}">${monthOpts}</select>`) + fld('ឆ្នាំ', `<input id="rx_y" type="number" min="2000" max="2100" value="${year}" class="${C.input}">`) + fld('ទម្រង់តារាង', `<select id="rx_f" class="${C.input}">${fmtOpts}</select>`)
        : fld('ឆ្នាំសិក្សាចាប់ផ្តើមនៅឆ្នាំ', `<input id="rx_sy" type="number" min="2000" max="2100" value="${sy}" class="${C.input}">`) + fld('ឆ្នាំសិក្សាចាប់ផ្តើមខែ', `<select id="rx_sm" class="${C.input}">${startOpts}</select>`)}
      ${fld('កម្រិត', `<input id="rx_level" value="${esc(level)}" placeholder="ឧ. ១" class="${C.input}">`)}
      ${fld('ចំណងជើងរង (ក្រោមចំណងជើង)', `<input id="rx_sub" value="${esc(sub)}" placeholder="ឧ. We Start English for Kids Level 1" class="${C.input}">`)}
    </div>`;
  }

  function drawPeriod() {
    const vis = visibleStu(), el = gid('rx_table');
    if (!vis.length) { el.innerHTML = `<div class="${C.card} p-12 text-center text-slate-500">${NDT}</div>`; return; }
    const P = periodData(), f2 = v => v === null ? ND : v.toFixed(2);
    const any = P.rows.some(r => r.c.has);
    const rows = P.rows.map((r, i) => `<tr><td>${i + 1}</td><td class="l">${esc(r.s.name)}</td><td>${esc(sexShort(r.s.gender))}</td>
      ${r.vals.map(v => `<td>${f2(v)}</td>`).join('')}
      <td><b>${f2(r.c.total)}</b></td><td><b>${f2(r.c.avg)}</b></td><td style="color:#dc2626;font-weight:700">${r.c.has ? r.rank : ND}</td><td class="rx-gr" style="color:#${gradeClr(fmt, r.c.grade)}">${r.c.has ? r.c.grade : ND}</td></tr>`).join('');
    el.innerHTML = `<div class="rx-act">
        <span class="text-sm font-semibold text-brand flex-1">${VIEWS[view]} ឆ្នាំសិក្សា ${khNum(sy)}-${khNum(sy + 1)} · គណនាពីមធ្យមភាគប្រចាំខែដោយស្វ័យប្រវត្តិ</span>
        <button type="button" data-a="xls" class="${C.ghost} !py-2.5 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100">ទាញយក Excel</button>
        <button type="button" data-a="pdf" class="${C.ghost} !py-2.5 bg-red-50 text-red-700 border-red-300 hover:bg-red-100">ទាញយក PDF</button>
      </div>
      ${any ? '' : `<div class="mb-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">${NDT} — ត្រូវបំពេញលទ្ធផលដែលពាក់ព័ន្ធឱ្យគ្រប់សិន ទើបគណនាបាន។</div>`}
      <div class="${C.card}"><div class="rx-wrap"><table class="rx-tbl">
        <thead><tr><th>ល.រ</th><th>គោត្តនាម នាម</th><th>ភេទ</th>${P.heads.map(h => `<th>${h}</th>`).join('')}<th>សរុប</th><th>មធ្យមភាគ</th><th>ចំ.ថ្នាក់</th><th>និទ្ទេស</th></tr></thead>
        <tbody>${rows}</tbody></table></div></div>`;
  }

  function drawTable() {
    if (view !== 'month') return drawPeriod();
    const vis = visibleStu(), F = FORMATS[fmt], el = gid('rx_table');
    if (!el) return;
    if (!vis.length) {
      el.innerHTML = `<div class="${C.card} p-12 text-center text-slate-500">${NDT}${students.length ? '' : '<div class="text-xs mt-2">សូមបន្ថែមសិស្សក្នុង tab "បញ្ជីឈ្មោះសិស្ស" ជាមុន</div>'}</div>`;
      return;
    }
    const rows = vis.map((s, i) => `<tr>
      <td>${i + 1}</td><td class="l">${esc(s.name)}</td><td>${esc(sexShort(s.gender))}</td>
      ${F.subjects.map(sj => `<td><input type="number" inputmode="decimal" min="0" step="any" data-sid="${s.id}" data-k="${sj.k}" value="${esc(entryOf(s)[sj.k] ?? '')}" class="rx-sc"></td>`).join('')}
      <td id="rx_tot_${s.id}"></td><td id="rx_avg_${s.id}"></td><td id="rx_rk_${s.id}" style="color:#dc2626;font-weight:700"></td><td id="rx_gr_${s.id}" class="rx-gr"></td>
    </tr>`).join('');
    el.innerHTML = `<div class="rx-act">
        <span class="text-sm font-semibold text-brand flex-1">សិស្ស ${khNum(vis.length)} នាក់ · បញ្ចូលពិន្ទុ រួចចុច "រក្សាទុក"</span>
        <span id="rx_dirty" style="color:#b45309;font-size:13px"></span>
        <button type="button" data-a="save" class="bg-brand text-white rounded-xl px-4 py-2.5 hover:brightness-110 active:scale-95 transition font-semibold text-sm shadow-sm">រក្សាទុក</button>
        <button type="button" data-a="xls" class="${C.ghost} !py-2.5 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100">ទាញយក Excel</button>
        <button type="button" data-a="pdf" class="${C.ghost} !py-2.5 bg-red-50 text-red-700 border-red-300 hover:bg-red-100">ទាញយក PDF</button>
      </div>
      <div class="${C.card}"><div class="rx-wrap"><table class="rx-tbl">
        <thead><tr><th rowspan="2">ល.រ</th><th rowspan="2">គោត្តនាម នាម</th><th rowspan="2">ភេទ</th><th colspan="${F.subjects.length}">ពិន្ទុ</th>
          <th rowspan="2">សរុប</th><th rowspan="2">មធ្យម</th><th rowspan="2">ចំណាត់<br>ថ្នាក់</th><th rowspan="2">និទ្ទេស</th></tr>
          <tr>${F.subjects.map(sj => `<th>${sj.l}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody></table></div></div>`;
    refreshCalc(); setDirty(dirty);
  }

  function setDirty(v) { dirty = v; const d = gid('rx_dirty'); if (d) d.textContent = v ? '● មិនទាន់រក្សាទុក' : ''; }

  function refreshCalc() {
    const vis = visibleStu();
    const cs = vis.map(s => calc(fmt, entryOf(s)));
    const rk = rankOf(cs.map(c => c.total));
    vis.forEach((s, i) => {
      const c = cs[i], set = (p, t, color) => { const e = gid(`rx_${p}_${s.id}`); if (e) { e.textContent = c.has ? t : NDT; e.classList.toggle('rx-nd', !c.has); if (color !== undefined && c.has) e.style.color = color; } };
      set('tot', c.total); set('avg', c.has ? c.avg.toFixed(2) : ''); set('rk', rk[i]); set('gr', c.grade, '#' + gradeClr(fmt, c.grade));
    });
  }

  async function saveScores() {
    const F = FORMATS[fmt], vis = visibleStu(), up = [], del = [], now = new Date().toISOString();
    vis.forEach(s => {
      const sid = String(s.id), e = entryOf(s), sc = { fmt };
      let any = false;
      F.subjects.forEach(x => { const n = num(e[x.k]); if (n !== null) { sc[x.k] = Math.max(n, 0); any = true; } });
      if (any) up.push({ student_id: s.id, year, month: month + 1, scores: sc, updated_at: now });
      else if (had.has(sid)) del.push(s.id);
    });
    try {
      for (let i = 0; i < up.length; i += 200) {
        const { error } = await sb.from(T_SC).upsert(up.slice(i, i + 200), { onConflict: 'student_id,year,month' });
        if (error) throw error;
      }
      if (del.length) {
        const { error } = await sb.from(T_SC).delete().in('student_id', del).eq('year', year).eq('month', month + 1);
        if (error) throw error;
      }
    } catch (e) { return alert('រក្សាទុកមិនបានទេ: ' + e.message + hint(e)); }
    up.forEach(r => { had.add(String(r.student_id)); raw.set(String(r.student_id), r.scores); });
    del.forEach(id => { had.delete(String(id)); raw.delete(String(id)); });
    hKey = ''; loadedKey = '';
    setDirty(false);
    alert('រក្សាទុកពិន្ទុរួចរាល់');
  }

  // ---------- ទិន្នន័យសម្រាប់ Export ----------
  function exportInfo() {
    const vis = visibleStu(), lv = String(level || '').trim();
    const base = {
      sub: String(sub || '').trim(), fk: fmt,
      teacherName: tid ? tname(tid) : '',
      dateLine: `ធ្វើនៅថ្ងៃទី................ខែ................ឆ្នាំ${khNum(view === 'month' ? year : sy + 1)}`
    };
    if (view === 'month') {
      const F = FORMATS[fmt];
      const cs = vis.map(s => calc(fmt, entryOf(s)));
      const rk = rankOf(cs.map(c => c.total));
      return { ...base, heads: F.subjects.map(s => s.l), group: 'ពិន្ទុ', avgHead: 'មធ្យម', colW: 10, dec: false,
        rows: vis.map((s, i) => ({ name: s.name || '', sex: sexShort(s.gender), vals: F.subjects.map(sj => num(entryOf(s)[sj.k])), c: cs[i], rank: rk[i], avgF: T => `ROUND(${T}/${cs[i].max}*100,2)` })),
        title1: 'លទ្ធផលប្រឡងប្រចាំខែ',
        title2: `${KH_M[month]} ឆ្នាំ ${khNum(year)}${lv ? ' កម្រិត ' + lv : ''}`,
        file: `តារាងលទ្ធផល_${tid ? tname(tid) : ''}${shift && shift !== '_' ? '_វេន' + shift : ''}_${KH_M[month]}${year}` };
    }
    const P = periodData();
    return { ...base, heads: P.heads, group: view[0] === 'q' ? 'មធ្យមភាគប្រចាំខែ' : view === 'year' ? 'មធ្យមភាគប្រចាំឆមាស' : 'មធ្យមភាគប្រចាំត្រីមាស', avgHead: 'មធ្យមភាគ', colW: 13, dec: true,
      rows: P.rows.map(r => ({ name: r.s.name || '', sex: sexShort(r.s.gender), vals: r.vals, c: r.c, rank: r.rank, avgF: T => `ROUND(${T}/${r.n},2)` })),
      title1: view === 'year' ? 'លទ្ធផលប្រចាំឆ្នាំ' : `លទ្ធផលប្រឡង${VIEWS[view]}`,
      title2: `ឆ្នាំសិក្សា ${khNum(sy)}-${khNum(sy + 1)}${lv ? ' កម្រិត ' + lv : ''}`,
      file: `តារាង${VIEWS[view]}_${tid ? tname(tid) : ''}${shift && shift !== '_' ? '_វេន' + shift : ''}_${sy}-${sy + 1}` };
  }

  async function exportExcel() {
    if (typeof ExcelJS === 'undefined') return alert('មិនទាន់ដាក់ script របស់ ExcelJS ក្នុង index.html ទេ');
    const I = exportInfo();
    if (!I.rows.length) return alert('មិនមានសិស្សសម្រាប់ទាញយកទេ');
    const { heads, group, avgHead, colW, dec, rows, title1, title2, sub: subT, teacherName, dateLine } = I;
    const nS = heads.length, N = 3 + nS + 4, cTot = 4 + nS, cAvg = cTot + 1, cRank = cTot + 2, cGr = cTot + 3;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('តារាងលទ្ធផល', { pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true } });
    ws.pageSetup.printTitlesRow = '6:7';
    ws.columns = [{ width: 5 }, { width: 24 }, { width: 6 }, ...heads.map(() => ({ width: colW })), { width: 9 }, { width: 10 }, { width: 11 }, { width: 10 }];
    const L = n => ws.getColumn(n).letter;

    const thin = { style: 'thin' }, bd = { top: thin, left: thin, bottom: thin, right: thin };
    const ctr = { horizontal: 'center', vertical: 'middle', wrapText: true };
    const put = (r, c1, c2, value, font, h) => {
      if (c2 > c1) ws.mergeCells(r, c1, r, c2);
      const c = ws.getCell(r, c1); c.value = value; c.font = font; c.alignment = ctr;
      if (h) ws.getRow(r).height = h;
      return c;
    };
    const leftEnd = Math.ceil(N / 2) - 1, rightStart = N - 4;

    // ក្បាលឯកសារ
    put(1, 1, leftEnd, SCHOOL_KH, { name: F_MOUL, size: 14 }, 26);
    put(1, rightStart, N, 'ព្រះរាជាណាចក្រកម្ពុជា', { name: F_MOUL, size: 12 });
    put(2, 1, leftEnd, SCHOOL_EN, { name: 'Times New Roman', size: 12, bold: true }, 22);
    put(2, rightStart, N, 'ជាតិ សាសនា ព្រះមហាក្សត្រ', { name: F_MOUL, size: 12 });
    ws.getRow(3).height = 8;
    put(4, 1, N, { richText: [{ text: title1 + ' ', font: { name: F_MOUL, size: 14 } }, { text: title2, font: { name: F_MOUL, size: 14, color: { argb: 'FFFF0000' } } }] }, { name: F_MOUL, size: 14 }, 28);
    if (subT) put(5, 1, N, subT, { name: 'Times New Roman', size: 12, bold: true, underline: true }, 20);

    // ក្បាលតារាង (ជួរ ៦-៧)
    const fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
    const hcell = (r1, c1, r2, c2, text) => {
      if (r2 > r1 || c2 > c1) ws.mergeCells(r1, c1, r2, c2);
      for (let r = r1; r <= r2; r++) for (let k = c1; k <= c2; k++) { const x = ws.getCell(r, k); x.border = bd; x.fill = fill; }
      const c = ws.getCell(r1, c1); c.value = text; c.font = { name: F_MOUL, size: 11 }; c.alignment = ctr;
    };
    hcell(6, 1, 7, 1, 'ល.រ'); hcell(6, 2, 7, 2, 'គោត្តនាម នាម'); hcell(6, 3, 7, 3, 'ភេទ'); hcell(6, 4, 6, 3 + nS, group);
    heads.forEach((h, i) => hcell(7, 4 + i, 7, 4 + i, h));
    hcell(6, cTot, 7, cTot, 'សរុប'); hcell(6, cAvg, 7, cAvg, avgHead); hcell(6, cRank, 7, cRank, 'ចំណាត់ថ្នាក់'); hcell(6, cGr, 7, cGr, 'និទ្ទេស');
    ws.getRow(6).height = 24; ws.getRow(7).height = 24;

    // ទិន្នន័យ (ចាប់ពីជួរ ៨) · សរុប/មធ្យម/ចំណាត់ថ្នាក់/និទ្ទេស ជារូបមន្ត Excel ដែលកែពិន្ទុបាន
    const first = 8, last = 7 + rows.length;
    rows.forEach((x, i) => {
      const r = first + i, row = ws.getRow(r);
      row.height = 24;
      [i + 1, x.name, x.sex, ...x.vals.map(v => v === null && (dec || !x.c.has) ? NDT : v)].forEach((v, j) => { row.getCell(j + 1).value = v; });
      for (let j = 1; j <= N; j++) {
        const c = row.getCell(j);
        c.border = bd;
        c.font = j === 2 || j === 3 ? { name: F_BODY, size: 11 } : { name: 'Times New Roman', size: 11, bold: j > 3 };
        c.alignment = { horizontal: j === 2 ? 'left' : 'center', vertical: 'middle' };
      }
      if (dec) for (let j = 4; j <= cAvg; j++) row.getCell(j).numFmt = '0.00';
      if (!x.c.has) for (let j = cTot; j <= cGr; j++) row.getCell(j).value = NDT;
      if (x.c.has) {
        const T = L(cTot), A = L(cAvg);
        row.getCell(cTot).value = { formula: `SUM(${L(4)}${r}:${L(3 + nS)}${r})`, result: x.c.total };
        row.getCell(cAvg).value = { formula: x.avgF(`${T}${r}`), result: x.c.avg };
        row.getCell(cAvg).numFmt = '0.00'; row.getCell(cTot).numFmt = dec ? '0.00' : 'General';
        row.getCell(cRank).value = { formula: `RANK(${T}${r},$${T}$${first}:$${T}$${last})`, result: x.rank };
        row.getCell(cRank).font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFF0000' } };
        row.getCell(cGr).value = { formula: `IF(${A}${r}>=90,"A",IF(${A}${r}>=80,"B",IF(${A}${r}>=70,"C",IF(${A}${r}>=60,"D",IF(${A}${r}>=50,"E","F")))))`, result: x.c.grade };
        row.getCell(cGr).font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FF' + gradeClr(I.fk, x.c.grade) } };
      }
      for (let j = 4; j <= N; j++) { const c = row.getCell(j); if (c.value === NDT) c.font = { name: F_BODY, size: 8, color: { argb: 'FF94A3B8' } }; }
    });

    // ហត្ថលេខា
    const sig = last + 2, fb = { name: F_BODY, size: 11 }, fbb = { name: F_BODY, size: 11, bold: true };
    put(sig, 1, leftEnd, 'បានឃើញ និង ឯកភាព', fb, 20); put(sig + 1, 1, leftEnd, dateLine, fb, 20); put(sig + 2, 1, leftEnd, 'នាយក', fbb, 20);
    put(sig, rightStart, N, dateLine, fb); put(sig + 1, rightStart, N, 'ហត្ថលេខា និង ឈ្មោះ', fb); put(sig + 2, rightStart, N, 'គ្រូបន្ទុកថ្នាក់', fbb);
    ws.getRow(sig + 3).height = 60;
    put(sig + 4, rightStart, N, teacherName, fbb, 20);

    const buf = await wb.xlsx.writeBuffer();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    a.download = I.file + '.xlsx';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  function exportPdf() {
    const I = exportInfo();
    if (!I.rows.length) return alert('មិនមានសិស្សសម្រាប់ទាញយកទេ');
    const { heads, group, avgHead, dec, rows, title1, title2, sub: subT, teacherName, dateLine } = I;
    const NDP = '<span style="color:#94a3b8;font-size:9px">' + NDT + '</span>';
    const fv = (v, has) => v === null ? ((dec || !has) ? NDP : '') : (dec ? v.toFixed(2) : v);
    const w = window.open('', '_blank');
    if (!w) return alert('Browser បានទប់ស្កាត់ផ្ទាំងថ្មី សូមអនុញ្ញាត Pop-up សិន');
    const body = rows.map((x, i) => `<tr><td>${i + 1}</td><td class="l">${esc(x.name)}</td><td>${esc(x.sex)}</td>`
      + x.vals.map(v => `<td>${fv(v, x.c.has)}</td>`).join('')
      + (x.c.has ? `<td><b>${fv(x.c.total)}</b></td><td><b>${x.c.avg.toFixed(2)}</b></td><td style="color:#dc2626"><b>${x.rank}</b></td><td style="color:#${gradeClr(I.fk, x.c.grade)}"><b>${x.c.grade}</b></td>` : `<td>${NDP}</td><td>${NDP}</td><td>${NDP}</td><td>${NDP}</td>`)
      + '</tr>').join('');
    w.document.write(`<!DOCTYPE html><html lang="km"><head><meta charset="utf-8"><title>${esc(title1 + ' ' + title2)}</title>
<link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&display=swap" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Khmer OS Battambang','Battambang',sans-serif; font-size: 12px; color: #000; }
  .moul { font-family: 'Khmer OS Moul Light','Moul',serif; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; }
  .top .l1 { text-align: center; line-height: 1.9; } .top .r1 { text-align: center; line-height: 1.9; font-size: 13px; }
  .en { font-family: 'Times New Roman',serif; font-weight: 700; font-size: 14px; }
  .ttl { text-align: center; font-size: 15px; margin-top: 12px; line-height: 1.8; } .ttl span { color: #ff0000; }
  .sub { text-align: center; font-family: 'Times New Roman',serif; font-weight: 700; font-size: 15px; text-decoration: underline; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-family: 'Times New Roman','Battambang',serif; }
  th, td { border: 1px solid #000; padding: 3px 4px; text-align: center; height: 24px; }
  th { background: #FFC000; font-family: 'Khmer OS Moul Light','Moul',serif; font-weight: 400; font-size: 11px; }
  td.l { text-align: left; font-family: 'Khmer OS Battambang','Battambang',sans-serif; white-space: nowrap; }
  tr { page-break-inside: avoid; } thead { display: table-header-group; }
  .sigs { display: flex; justify-content: space-between; margin-top: 14px; page-break-inside: avoid; line-height: 1.9; }
  .sigs > div { width: 42%; text-align: center; } .sp { height: 70px; }
</style></head><body>
  <div class="top">
    <div class="l1"><div class="moul" style="font-size:14px">${SCHOOL_KH}</div><div class="en">${SCHOOL_EN}</div></div>
    <div class="r1 moul"><div>ព្រះរាជាណាចក្រកម្ពុជា</div><div>ជាតិ សាសនា ព្រះមហាក្សត្រ</div></div>
  </div>
  <div class="ttl moul">${esc(title1)} <span>${esc(title2)}</span></div>
  ${subT ? `<div class="sub">${esc(subT)}</div>` : ''}
  <table><thead>
    <tr><th rowspan="2">ល.រ</th><th rowspan="2">គោត្តនាម នាម</th><th rowspan="2">ភេទ</th><th colspan="${heads.length}">${group}</th><th rowspan="2">សរុប</th><th rowspan="2">${avgHead}</th><th rowspan="2">ចំណាត់<br>ថ្នាក់</th><th rowspan="2">និទ្ទេស</th></tr>
    <tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr>
  </thead><tbody>${body}</tbody></table>
  <div class="sigs">
    <div><div>បានឃើញ និង ឯកភាព</div><div>${dateLine}</div><div><b>នាយក</b></div></div>
    <div><div>${dateLine}</div><div>ហត្ថលេខា និង ឈ្មោះ</div><div><b>គ្រូបន្ទុកថ្នាក់</b></div><div class="sp"></div><div><b>${esc(teacherName)}</b></div></div>
  </div>
  <script>document.fonts.ready.then(() => setTimeout(() => window.print(), 400));<\/script>
</body></html>`);
    w.document.close();
  }

  // ---------- event របស់ tab តារាងលទ្ធផល ----------
  const okLeave = () => !dirty || confirm('មានពិន្ទុមិនទាន់រក្សាទុក។ បន្តនឹងបាត់ការកែប្រែទាំងនោះ?');
  function bindResults() {
    const root = gid('rx_root');
    root.onclick = async e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      if (b.dataset.a === 'save') await saveScores();
      else if (b.dataset.a === 'xls') await exportExcel();
      else if (b.dataset.a === 'pdf') exportPdf();
    };
    root.oninput = e => {
      const t = e.target, d = t.dataset;
      if (d.sid !== undefined) {
        const cur = entry.get(d.sid) || {}; cur[d.k] = t.value; entry.set(d.sid, cur);
        setDirty(true); refreshCalc();
      } else if (t.id === 'rx_level') { level = t.value; savePref(); }
      else if (t.id === 'rx_sub') { sub = t.value; savePref(); }
    };
    root.onchange = async e => {
      const t = e.target, d = t.dataset;
      if (d.sid !== undefined) return;
      if (t.id === 'rx_f') { fmt = t.value; savePref(); return drawTable(); }
      if (!okLeave()) return drawFilters();
      if (t.id === 'rx_v') { view = t.value; await loadResults(false); return; }
      if (t.id === 'rx_sy') { const y = Number(t.value); if (y >= 2000 && y <= 2100) { sy = y; await loadResults(false); } else drawFilters(); return; }
      if (t.id === 'rx_sm') { syStart = Number(t.value); try { localStorage.setItem('csi_res_sm', String(syStart)); } catch (e) { /* ignore */ } await loadResults(false); return; }
      if (t.id === 'rx_t') { tid = t.value; shift = ''; await loadResults(true); }
      else if (t.id === 'rx_s') { shift = t.value; applyClass(); setDirty(false); drawResults(); }
      else if (t.id === 'rx_m') { month = Number(t.value); await loadResults(false); }
      else if (t.id === 'rx_y') { const y = Number(t.value); if (y >= 2000 && y <= 2100) { year = y; await loadResults(false); } else drawFilters(); }
    };
    root.onkeydown = e => {   // Enter = ចុះទៅក្រោមក្នុងជួរឈរដដែល
      const d = e.target.dataset;
      if (e.key !== 'Enter' || d.sid === undefined) return;
      e.preventDefault();
      const all = [...root.querySelectorAll(`input[data-k="${d.k}"]`)], i = all.indexOf(e.target);
      (all[i + 1] || all[0]).focus();
    };
  }

  // =====================================================================
  //  តារាងកិត្តិយស (សិស្សចំណាត់ថ្នាក់ខ្ពស់ក្នុងថ្នាក់នីមួយៗ)
  // =====================================================================
  function shellHonor() {
    return `<div id="rx_hroot">
      <h2 class="font-bold text-brand text-base sm:text-lg mb-3 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>តារាងកិត្តិយស</h2>
      <div id="rx_herr"></div>
      <div id="rx_hfilters" class="${C.card} p-4 mb-4"></div>
      <div id="rx_hlist"></div>
    </div>`;
  }

  function drawHonor() {
    if (!gid('rx_hroot')) return;
    gid('rx_herr').innerHTML = hErr ? `<div class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">មិនអាចទាញទិន្នន័យបានទេ៖ ${esc(hErr)}</div>` : '';
    const monthOpts = KH_M.map((m, i) => `<option value="${i}" ${month === i ? 'selected' : ''}>ខែ${m}</option>`).join('');
    const topOpts = [3, 5, 10].map(n => `<option value="${n}" ${hTop === n ? 'selected' : ''}>ចំណាត់ថ្នាក់ទី ១ ដល់ ${khNum(n)}</option>`).join('');
    gid('rx_hfilters').innerHTML = `<div class="rx-bar">
      ${isAdmin() ? fld('គ្រូ', `<select id="rx_h_t" class="${C.input}"><option value="">គ្រូទាំងអស់</option>${tOpts(hTid)}</select>`) : ''}
      ${fld('ខែ', `<select id="rx_h_m" class="${C.input}">${monthOpts}</select>`)}
      ${fld('ឆ្នាំ', `<input id="rx_h_y" type="number" min="2000" max="2100" value="${year}" class="${C.input}">`)}
      ${fld('បង្ហាញ', `<select id="rx_h_k" class="${C.input}">${topOpts}</select>`)}
    </div>`;

    const el = gid('rx_hlist');
    if (!hData) { el.innerHTML = `<div class="${C.card} p-12 text-center text-slate-500">កំពុងទាញទិន្នន័យ...</div>`; return; }
    const groups = new Map();
    hData.students.forEach(s => { const k = s.teacher_id + '|' + (s.shift || ''); (groups.get(k) || groups.set(k, []).get(k)).push(s); });
    const cards = [...groups.entries()].map(([k, list]) => {
      const gf = list.map(s => hData.raw.get(String(s.id))).find(x => x && FORMATS[x.fmt]);
      const fk = gf ? gf.fmt : 'kh_en';
      const cs = list.map(s => calc(fk, hData.raw.get(String(s.id))));
      const rk = rankOf(cs.map(c => c.total));
      const top = list.map((s, i) => ({ s, c: cs[i], r: rk[i] })).filter(x => x.c.has && x.r <= hTop).sort((a, b) => a.r - b.r || a.s.id - b.s.id);
      return { t: list[0].teacher_id, sh: list[0].shift || '', top, fk };
    }).filter(g => g.top.length)
      .sort((a, b) => tIndex(a.t) - tIndex(b.t) || SHIFTS.indexOf(a.sh) - SHIFTS.indexOf(b.sh));

    const medal = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `<span style="font-size:15px;font-weight:700;color:#64748b">${khNum(r)}</span>`;
    el.innerHTML = cards.length
      ? `<div class="rx-honor">${cards.map(g => `<div class="rx-hc">
          <div style="font-weight:700;color:#1E3A8A;margin-bottom:6px">${esc(tname(g.t))}${g.sh ? ' · វេន' + g.sh : ''}</div>
          ${g.top.map(x => `<div class="rx-hr"><div class="rx-medal">${medal(x.r)}</div>
            <div><div style="font-weight:600">${esc(x.s.name)}</div><div style="font-size:12px;color:#64748b">សរុប ${x.c.total} · មធ្យម ${x.c.avg.toFixed(2)}</div></div>
            <div class="rx-gr" style="color:#${gradeClr(g.fk, x.c.grade)}">${x.c.grade}</div></div>`).join('')}
        </div>`).join('')}</div>`
      : `<div class="${C.card} p-12 text-center text-slate-500">${NDT}<div class="text-xs mt-2">ខែ${KH_M[month]} ឆ្នាំ${khNum(year)} · សូមបញ្ចូលពិន្ទុក្នុង tab "តារាងលទ្ធផល" ជាមុន</div></div>`;
  }

  async function loadHonor() {
    if (typeof me === 'undefined' || !me) return;
    const ids = hTid ? [hTid] : (teacherIds().length ? teacherIds() : [me.id]);
    const key = `${ids.join(',')}|${year}|${month}`;
    if (key === hKey && hData) return drawHonor();
    hData = null; drawHonor();
    try {
      hErr = '';
      const stu = activeOnly(await fetchAll(() => stuSelect().in('teacher_id', ids).order('id')));
      const sc = await fetchScores(stu.map(s => s.id));
      const raw2 = new Map(sc.map(r => [String(r.student_id), r.scores || {}]));
      hData = { students: stu, raw: raw2 }; hKey = key;
    } catch (e) { hErr = e.message + hint(e); hData = { students: [], raw: new Map() }; hKey = ''; }
    drawHonor();
  }

  function bindHonor() {
    gid('rx_hroot').onchange = async e => {
      const t = e.target;
      if (t.id === 'rx_h_t') hTid = t.value;
      else if (t.id === 'rx_h_m') month = Number(t.value);
      else if (t.id === 'rx_h_y') { const y = Number(t.value); if (y >= 2000 && y <= 2100) year = y; }
      else if (t.id === 'rx_h_k') { hTop = Number(t.value); return drawHonor(); }
      await loadHonor();
    };
  }

  // ---------- ភ្ជាប់ចូល render() របស់ app.js / roster.js ----------
  const _render = window.render;
  window.render = function () {
    // បើកដំបូងចូលមក tab "បញ្ជីឈ្មោះសិស្ស" ជានិច្ច
    if (!started && typeof me !== 'undefined' && me) { started = true; activeTab = 'roster'; }
    _render();
    injectTabs();
    if (activeTab !== 'results' && activeTab !== 'honor') return;
    const main = document.querySelector('#app main');
    if (!main) return;
    if (activeTab === 'results') {
      main.innerHTML = shellResults();
      bindResults();
      if (loadedKey === curKey() && students.length) drawResults(); else loadResults(false);
    } else {
      main.innerHTML = shellHonor();
      bindHonor();
      loadHonor();
    }
  };

  window.RX = { FORMATS, calc, rankOf, gradeOf, R2, KH_M, SHIFTS };
  if (typeof window !== 'undefined' && window.__RX_TEST__) window.__RX_TEST__.api = { periodData, setView: (v, a, b) => { view = v; sy = a; syStart = b; }, loadResults, calc, rankOf, FORMATS, gradeOf, exportInfo, exportExcel, exportPdf, setState: o => { ({ tid, shift, month, year, fmt, level, sub } = Object.assign({ tid, shift, month, year, fmt, level, sub }, o)); }, getEntry: () => entry };
})();
