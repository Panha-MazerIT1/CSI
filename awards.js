// ===== awards.js · tab "ឯកសារបោះពុម្ព" (សម្រាប់ admin ប៉ុណ្ណោះ) =====
// តារាងកិត្តិយសប្រចាំខែ/ត្រីមាស · ប័ណ្ណសរសើរប្រចាំត្រីមាស · កាតសិស្ស  (មានគម្រូ ហើយកែ/ប្តូរគម្រូបាន)
// ដាក់ក្នុង index.html បន្ទាប់ពី results.js:  <script src="awards.js"></script>
(() => {
  const T_STU = 'roster_students', T_SC = 'roster_scores', T_CS = 'roster_class_settings';
  const gid = id => document.getElementById(id);
  const NDT = 'គ្មានទិន្នន័យ';
  const SHIFTS = ['ព្រឹក', 'ថ្ងៃ', 'ល្ងាច'];
  const KH_M = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  const khd = v => String(v ?? '').replace(/\d/g, d => '០១២៣៤៥៦៧៨៩'[d]);
  const genderKh = g => /ស្រី|^ស$|^f/i.test(g || '') ? 'ស្រី' : /ប្រុស|^ប$|^m/i.test(g || '') ? 'ប្រុស' : (g || '');
  const dobKh = iso => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${khd(m[3])}-${KH_M[Number(m[2]) - 1]}-${khd(m[1])}` : ''; };
  const enrKh = iso => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${khd(m[3])}-${khd(m[2])}-${khd(m[1])}` : ''; };
  const code = s => s.student_code || ('A' + String(s.id).padStart(4, '0'));
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };

  // ---------- ទំហំក្រដាស និងគម្រូលំនាំដើម ----------
  const PAGES = { A4P: { w: 210, h: 297, label: 'A4 ឈរ' }, A4L: { w: 297, h: 210, label: 'A4 ដេក' }, CARD: { w: 54, h: 85, label: 'កាត (54×85 មម)' } };
  const FONTS = { moul: "'Khmer OS Moul Light','Moul',serif", body: "'Khmer OS Battambang','Battambang',sans-serif", en: "'Times New Roman',Times,serif" };
  const T = (id, label, text, x, y, w, size, o = {}) => ({ id, label, kind: 'text', text, x, y, w, size, color: '#1f1fa8', font: 'moul', bold: false, align: 'center', accent: '#d32f2f', ...o });
  const P = (id, label, x, y, w, h, o = {}) => ({ id, label, kind: 'photo', x, y, w, h, shape: 'rect', ...o });
  const circ = (cx, cy, r) => [(cx - r) / 2480 * 100, (cy - r) / 3508 * 100, 2 * r / 2480 * 100, 2 * r / 3508 * 100];
  const DEFAULTS = {
    honor: {
      label: 'តារាងកិត្តិយស', img: 'templates/honor.webp', page: 'A4P', under: true,
      tokens: '{location} {period} {school_year} {name1}..{name5} {teacher} {lunar} {date_greg}',
      fields: [
        T('loc', 'ទីតាំង', 'ទីតាំង: {location}', 16.2, 13.6, 14, 1.7, { color: '#5b3a10' }),
        T('t2', 'ចំណងជើងទី ២', 'លទ្ធផល {period}', 20, 17.6, 60, 3.7),
        T('t3', 'ចំណងជើងទី ៣', 'ឆ្នាំសិក្សា {school_year}', 25, 20.9, 50, 3.0),
        P('p1', 'រូបទី ១', ...circ(1246, 1246, 282), { shape: 'circle', rank: 1 }), P('p2', 'រូបទី ២', ...circ(502, 1488, 240), { shape: 'circle', rank: 2 }),
        P('p3', 'រូបទី ៣', ...circ(1979, 1488, 239), { shape: 'circle', rank: 3 }), P('p4', 'រូបទី ៤', ...circ(703, 2301, 200), { shape: 'circle', rank: 4 }),
        P('p5', 'រូបទី ៥', ...circ(1764, 2300, 200), { shape: 'circle', rank: 5 }),
        T('n1', 'ឈ្មោះទី ១', '{name1}', 41.8, 45.6, 17, 2.0, { color: '#111111' }), T('n2', 'ឈ្មោះទី ២', '{name2}', 11.7, 51.1, 17, 2.0, { color: '#111111' }),
        T('n3', 'ឈ្មោះទី ៣', '{name3}', 71.3, 51.1, 17, 2.0, { color: '#111111' }), T('n4', 'ឈ្មោះទី ៤', '{name4}', 19.8, 72.3, 17, 2.0, { color: '#111111' }),
        T('n5', 'ឈ្មោះទី ៥', '{name5}', 62.7, 72.3, 17, 2.0, { color: '#111111' }),
        T('lunar', 'ថ្ងៃខែចន្ទគតិ', '{lunar}', 55.6, 79.0, 36, 1.3, { font: 'body', color: '#1d1d6e' }),
        T('greg', 'ថ្ងៃខែគ្រិស្តសករាជ', 'កំចាយមារ {date_greg}', 55.6, 80.6, 36, 1.3, { font: 'body', color: '#1d1d6e' }),
        T('teacher', 'ឈ្មោះគ្រូ', '{teacher}', 70.4, 90.7, 16, 1.6)
      ]
    },
    cert: {
      label: 'ប័ណ្ណសរសើរ', img: 'templates/certificate.webp', page: 'A4L', under: false,
      tokens: '{name} {gender} {dob} {course} {rank} {quarter} {school_year} {lunar} {date_greg} {teacher}  (*អក្សរ* = ពណ៌បន្លិច)',
      fields: [
        T('l1', 'បន្ទាត់ទី ១', 'សូមធ្វើការសរសើរចំពោះសិស្សឈ្មោះ {name}   ភេទ {gender} សញ្ជាតិ ខ្មែរ', 13.3, 37.1, 76, 1.75, { color: '#262b85', align: 'left' }),
        T('l2', 'បន្ទាត់ទី ២', 'ថ្ងៃខែឆ្នាំកំណើត៖ {dob} ដែលបានសិក្សានៅ សាលាអន្តរទ្វីប ខូស្បេស៍ នូវវគ្គ', 13.3, 41.9, 76, 1.75, { color: '#262b85', align: 'left' }),
        T('l3', 'ឈ្មោះវគ្គសិក្សា', '{course}', 25, 45.8, 50, 2.5, { color: '#c62828', font: 'en', bold: true }),
        T('l4', 'បន្ទាត់ទី ៤', 'ព្រមទាំងគោរពវិន័យសាលា និងខិតខំព្យាយាមរៀនសូត្របានល្អ ហើយទទួលបានចំណាត់', 13.3, 50.9, 76, 1.75, { color: '#262b85', align: 'left' }),
        T('l5', 'បន្ទាត់ទី ៥', 'ថ្នាក់លេខ *{rank}* ប្រចាំ *ត្រីមាសទី{quarter}* នាឆ្នាំសិក្សា {school_year}', 13.3, 55.7, 76, 1.75, { color: '#262b85', align: 'left' }),
        T('lunarL', 'ចន្ទគតិ (ឆ្វេង)', '{lunar}', 8, 65.3, 34, 1.3, { color: '#262b85' }), T('gregL', 'គ្រិស្តសករាជ (ឆ្វេង)', 'កំចាយមារ {date_greg}', 8, 68.6, 34, 1.3, { color: '#262b85' }),
        T('lunarR', 'ចន្ទគតិ (ស្តាំ)', '{lunar}', 57.7, 65.3, 34, 1.3, { color: '#262b85' }), T('gregR', 'គ្រិស្តសករាជ (ស្តាំ)', 'កំចាយមារ {date_greg}', 57.7, 68.6, 34, 1.3, { color: '#262b85' }),
        T('teacher', 'ឈ្មោះគ្រូ', '{teacher}', 62.9, 84.1, 30, 1.6, { color: '#262b85' }),
        P('photo', 'រូបសិស្ស', 44.5, 68.3, 11.07, 20.5, { src: 'student' })
      ]
    },
    card: {
      label: 'កាតសិស្ស', img: 'templates/card.webp', page: 'CARD', under: false,
      tokens: '{name} {code} {level} {enrolled} {phone}',
      fields: [
        P('photo', 'រូបសិស្ស', 32.1, 23.4, 35.0, 28.5, { src: 'student' }),
        T('name', 'ឈ្មោះ', '{name}', 5, 56.6, 90, 6.4, { color: '#000000' }),
        T('code', 'លេខសម្គាល់', '{code}', 49.7, 63.6, 39.6, 6.2, { color: '#ff7f27', font: 'en', bold: true }),
        T('level', 'កម្រិត', '{level}', 49.7, 69.4, 39.6, 6.6, { color: '#ff7f27' }),
        T('enrolled', 'ថ្ងៃចូលរៀន', '{enrolled}', 49.7, 76.2, 39.6, 5.0, { color: '#ff7f27' }),
        T('phone', 'លេខទូរស័ព្ទ', '{phone}', 49.7, 83.0, 39.6, 5.4, { color: '#ff7f27', font: 'en', bold: true })
      ]
    }
  };
  const DOCS = {
    honor_m: { label: 'តារាងកិត្តិយសប្រចាំខែ', tpl: 'honor' },
    honor_q: { label: 'តារាងកិត្តិយសប្រចាំត្រីមាស', tpl: 'honor' },
    cert_q: { label: 'ប័ណ្ណសរសើរប្រចាំត្រីមាស', tpl: 'cert' },
    card: { label: 'កាតសិស្ស', tpl: 'card' }
  };

  // ---------- ការរក្សាទុកគម្រូដែលបានកែ (fields ក្នុង localStorage, រូបផ្ទៃខាងក្រោយក្នុង IndexedDB) ----------
  const idb = {
    open: () => new Promise((res, rej) => { const r = indexedDB.open('csi_tpl', 1); r.onupgradeneeded = () => r.result.createObjectStore('img'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }),
    async get(k) { const db = await this.open(); return new Promise((res, rej) => { const q = db.transaction('img').objectStore('img').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error); }); },
    async set(k, v) { const db = await this.open(); return new Promise((res, rej) => { const q = db.transaction('img', 'readwrite').objectStore('img').put(v, k); q.onsuccess = () => res(); q.onerror = () => rej(q.error); }); },
    async del(k) { const db = await this.open(); return new Promise((res, rej) => { const q = db.transaction('img', 'readwrite').objectStore('img').delete(k); q.onsuccess = () => res(); q.onerror = () => rej(q.error); }); }
  };
  let cfg = {}; try { cfg = JSON.parse(lsGet('csi_tpl_cfg_v1', '{}')) || {}; } catch (e) { cfg = {}; }
  const blobUrl = {};     // name -> object URL នៃរូបផ្ទៃខាងក្រោយដែលបានផ្ទុកឡើង
  let customLoaded = false;
  const saveCfg = () => lsSet('csi_tpl_cfg_v1', JSON.stringify(cfg));
  const clone = o => JSON.parse(JSON.stringify(o));
  const tFields = n => (cfg[n] && cfg[n].fields) ? cfg[n].fields : DEFAULTS[n].fields;
  const tUnder = n => (cfg[n] && typeof cfg[n].under === 'boolean') ? cfg[n].under : DEFAULTS[n].under;
  const tPage = n => PAGES[(cfg[n] && cfg[n].page) || DEFAULTS[n].page];
  const tBg = n => blobUrl[n] || new URL(DEFAULTS[n].img, location.href).href;
  async function loadCustom() {
    if (customLoaded) return; customLoaded = true;
    for (const n of Object.keys(DEFAULTS)) {
      try { const b = await idb.get(n); if (b) blobUrl[n] = URL.createObjectURL(b); } catch (e) { /* ignore */ }
    }
  }

  // ---------- ការគូរទំព័រមួយ (ប្រើទាំងមើលជាមុន និងបោះពុម្ព) ----------
  const subst = (text, ctx) => String(text || '').replace(/\{(\w+)\}/g, (_, k) => (ctx[k] === undefined || ctx[k] === null) ? '' : esc(ctx[k]));
  function pageHtml(name, ctx, photos, opt = {}) {
    const flds = opt.fields || tFields(name), under = opt.under ?? tUnder(name), bg = opt.bg || tBg(name);
    const body = flds.map(f => {
      if (f.kind === 'photo') {
        const url = f.src === 'student' ? photos.student : photos['r' + f.rank];
        const radius = f.shape === 'circle' ? 'border-radius:50%;' : '';
        return `<div class="ph" style="left:${f.x}%;top:${f.y}%;width:${f.w}%;height:${f.h}%;${radius}z-index:${under ? 1 : 3}">${url ? `<img src="${esc(url)}" alt="">` : ''}</div>`;
      }
      const html = subst(f.text, ctx).replace(/\*([^*]+)\*/g, `<span style="color:${esc(f.accent || f.color)}">$1</span>`);
      const left = f.x, w = f.w;
      return `<div class="f" style="left:${left}%;top:${f.y}%;width:${w}%;font-size:calc(var(--w) * ${f.size / 100});color:${esc(f.color)};text-align:${f.align};font-family:${FONTS[f.font] || FONTS.body};font-weight:${f.bold ? 700 : 400}">${html}</div>`;
    }).join('');
    return `<div class="pg"><img class="bg" src="${esc(bg)}" alt="">${body}</div>`;
  }
  const BASE_CSS = `
    .pg{position:relative;width:var(--w);height:calc(var(--w) * var(--r));overflow:hidden;background:#fff}
    .pg .bg{position:absolute;inset:0;width:100%;height:100%;z-index:2;display:block}
    .pg .ph{position:absolute;overflow:hidden;background:#e5e7eb}
    .pg .ph img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
    .pg .f{position:absolute;z-index:4;white-space:nowrap;transform:translateY(-50%);line-height:1.5;overflow:visible}`;
  function fitAll(root) {
    root.querySelectorAll('.f').forEach(el => {
      let fs = parseFloat(getComputedStyle(el).fontSize), n = 0;
      while (el.scrollWidth > el.clientWidth + 1 && n < 40) { fs *= 0.95; el.style.fontSize = fs + 'px'; n++; }
    });
  }
  function ensureFonts() {
    if (document.getElementById('aw_fonts')) return;
    const l = document.createElement('link'); l.id = 'aw_fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&display=swap';
    document.head.appendChild(l);
    const st = document.createElement('style'); st.id = 'aw_css';
    st.textContent = BASE_CSS + `
      .aw-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
      .aw-chip{padding:8px 16px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;font-weight:600;font-size:14px;cursor:pointer}
      .aw-chip.on{background:#1E3A8A;color:#fff;border-color:#1E3A8A}
      .aw-tbl{width:100%;border-collapse:collapse;font-size:14px}.aw-tbl th,.aw-tbl td{border-bottom:1px solid #e2e8f0;padding:8px;text-align:left}
      .aw-tbl th{background:#f1f5f9;font-weight:700}
      .aw-modal{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:80;display:flex;align-items:center;justify-content:center;padding:12px}
      .aw-box{background:#fff;border-radius:16px;max-width:1100px;width:100%;max-height:94vh;overflow:auto;padding:16px}
      .aw-ed{display:grid;grid-template-columns:minmax(260px,420px) 1fr;gap:16px}
      @media(max-width:800px){.aw-ed{grid-template-columns:1fr}}
      .aw-prev{border:1px solid #cbd5e1;box-shadow:0 2px 12px rgba(0,0,0,.12);margin:0 auto}
      .aw-g2{display:grid;grid-template-columns:1fr 1fr;gap:8px}`;
    document.head.appendChild(st);
  }

  // ---------- state ----------
  const RX = () => window.RX;
  let docType = 'honor_m', fTeacher = '', fShift = '', topN = 5, quarter = 1;
  let month = new Date().getMonth(), year = new Date().getFullYear();
  let syStart = Number(lsGet('csi_res_sm', 7)) || 7;
  let sy = (new Date().getMonth() + 1) >= syStart ? year : year - 1;
  let location_ = lsGet('csi_docs_loc', ''), lunar = lsGet('csi_docs_lunar', ''), gdate = new Date().toISOString().slice(0, 10), cardLayout = 'sheet';
  let data = null, dataKey = '', loading = false, err = '';
  const offClass = new Set(), offStu = new Set();
  let started = false;

  const teacherList = () => (typeof teachers !== 'undefined' && teachers ? teachers : []);
  const hint = e => /roster_scores|roster_class_settings|relation|schema cache|does not exist|student_code/i.test((e && e.message) || '') ? '\n(ត្រូវ run ឯកសារ SQL ថ្មីក្នុង Supabase ម្តងសិន)' : '';
  async function fetchAll(build) {
    const out = [];
    for (let i = 0; ; i += 1000) { const { data: d, error } = await build().range(i, i + 999); if (error) throw error; out.push(...(d || [])); if (!d || d.length < 1000) break; }
    return out;
  }

  // ---------- ខែក្នុងត្រីមាស ----------
  function quarterMonths() {
    const o = [];
    for (let i = 0; i < 3; i++) { const k = syStart - 1 + (quarter - 1) * 3 + i; o.push({ y: sy + (k >= 12 ? 1 : 0), m: (k % 12) + 1 }); }
    return o;
  }
  const schoolYearOf = () => docType === 'honor_m' ? ((month + 1) >= syStart ? year : year - 1) : sy;
  const periodText = () => docType === 'honor_m' ? `ប្រចាំខែ ${KH_M[month]}` : `ប្រចាំត្រីមាសទី${khd(quarter)}`;

  // ---------- ទាញទិន្នន័យ ----------
  const needKey = () => [fTeacher, docType === 'honor_m' ? `m${year}-${month}` : `q${sy}-${syStart}-${quarter}`, docType === 'card' ? 'c' : 's'].join('|');
  async function loadData(force) {
    if (!force && data && dataKey === needKey()) return;
    loading = true; err = ''; draw();
    try {
      const ids = fTeacher ? [fTeacher] : teacherList().map(t => t.id);
      const stu = (await fetchAll(() => sb.from(T_STU).select('*').in('teacher_id', ids).order('id'))).filter(s => !s.deleted_at);
      const raw = new Map();
      if (docType !== 'card') {
        const ys = docType === 'honor_m' ? [year] : [sy, sy + 1];
        for (let i = 0; i < stu.length; i += 100) {
          const part = await fetchAll(() => sb.from(T_SC).select('student_id,year,month,scores').in('year', ys).in('student_id', stu.slice(i, i + 100).map(s => s.id)).order('id'));
          part.forEach(r => raw.set(`${r.student_id}|${r.year}|${r.month}`, r.scores || {}));
        }
      }
      const settings = new Map();
      try { const { data: cs } = await sb.from(T_CS).select('*'); (cs || []).forEach(r => settings.set(`${r.teacher_id}|${r.shift || ''}`, r)); } catch (e) { /* table missing */ }
      const groups = new Map();
      stu.forEach(s => { const k = `${s.teacher_id}|${s.shift || ''}`; (groups.get(k) || groups.set(k, []).get(k)).push(s); });
      const classes = [...groups.entries()].map(([key, list]) => ({ key, tid: list[0].teacher_id, shift: list[0].shift || '', students: list }))
        .sort((a, b) => (typeof tIndex === 'function' ? tIndex(a.tid) - tIndex(b.tid) : 0) || SHIFTS.indexOf(a.shift) - SHIFTS.indexOf(b.shift));
      data = { stu, raw, settings, classes }; dataKey = needKey();
    } catch (e) { err = e.message + hint(e); data = null; dataKey = ''; }
    loading = false; draw();
  }

  // ---------- គណនាចំណាត់ថ្នាក់តាមថ្នាក់ ----------
  function rankClass(cls) {
    const rx = RX(), months = docType === 'honor_m' ? [{ y: year, m: month + 1 }] : quarterMonths();
    const rows = cls.students.map(s => {
      const avgs = months.map(({ y, m }) => {
        const sc = data.raw.get(`${s.id}|${y}|${m}`); if (!sc) return null;
        const c = rx.calc(rx.FORMATS[sc.fmt] ? sc.fmt : 'kh_en', sc); return c.has ? c.avg : null;
      });
      const ok = avgs.every(v => v !== null);
      const total = ok ? rx.R2(avgs.reduce((a, v) => a + v, 0)) : null;
      return { s, total, avg: ok ? rx.R2(total / avgs.length) : null };
    });
    const rk = rx.rankOf(rows.map(r => r.total));
    rows.forEach((r, i) => { r.rank = rk[i]; r.grade = r.avg !== null ? rx.gradeOf(r.avg) : ''; });
    return rows;
  }
  const setting = cls => (data.settings.get(cls.key) || {});
  const activeClasses = () => (data ? data.classes.filter(c => (!fShift || c.shift === fShift) && !offClass.has(c.key)) : []);
  const visibleClasses = () => (data ? data.classes.filter(c => !fShift || c.shift === fShift) : []);

  // ---------- សង់ list នៃទំព័រដែលត្រូវបោះពុម្ព ----------
  function buildItems() {
    if (!data) return [];
    const items = [], date = gdate ? (() => { const m = gdate.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `ថ្ងៃទី${khd(m[3])} ខែ${KH_M[Number(m[2]) - 1]} ឆ្នាំ${khd(m[1])}` : ''; })() : '';
    const common = { location: location_, lunar, date_greg: date, school_year: `${khd(schoolYearOf())}-${khd(schoolYearOf() + 1)}`, period: periodText(), quarter: khd(quarter) };
    activeClasses().forEach(cls => {
      const st = setting(cls), teacher = tname(cls.tid);
      if (docType === 'card') {
        cls.students.filter(s => !offStu.has(String(s.id))).forEach(s => items.push({ kind: 'card', s, ctx: { ...common, name: s.name, code: code(s), level: khd(st.level || ''), enrolled: enrKh(s.enrolled_at), phone: s.phone || '', teacher } }));
        return;
      }
      const ranked = rankClass(cls);
      if (docType === 'cert_q') {
        ranked.filter(r => r.rank !== null && r.rank <= topN && !offStu.has(String(r.s.id)))
          .sort((a, b) => a.rank - b.rank || a.s.id - b.s.id)
          .forEach(r => items.push({ kind: 'cert', s: r.s, rank: r.rank, ctx: { ...common, name: r.s.name, gender: genderKh(r.s.gender), dob: dobKh(r.s.dob), course: st.subtitle || '', rank: khd(r.rank), teacher } }));
        return;
      }
      const top = ranked.filter(r => r.rank !== null && r.rank <= 5).sort((a, b) => a.rank - b.rank || a.s.id - b.s.id).slice(0, 5);
      if (!top.length) return;
      const ctx = { ...common, teacher };
      top.forEach((r, i) => { ctx['name' + (i + 1)] = r.s.name; });
      items.push({ kind: 'honor', cls, top, ctx });
    });
    return items;
  }
  const itemTpl = it => it.kind === 'honor' ? 'honor' : it.kind === 'cert' ? 'cert' : 'card';
  async function signed(paths) {
    const map = new Map(), uniq = [...new Set(paths.filter(Boolean))];
    for (let i = 0; i < uniq.length; i += 100) {
      try { const { data: d } = await sb.storage.from(PHOTO_BUCKET).createSignedUrls(uniq.slice(i, i + 100), 3600); (d || []).forEach(x => { if (x.signedUrl) map.set(x.path, x.signedUrl); }); } catch (e) { /* ignore */ }
    }
    return map;
  }
  const itemPhotos = (it, sm) => {
    if (it.kind === 'honor') { const o = {}; it.top.forEach((r, i) => { o['r' + (i + 1)] = sm.get(r.s.photo_path); }); return o; }
    return { student: sm.get(it.s.photo_path) };
  };
  const itemPaths = it => it.kind === 'honor' ? it.top.map(r => r.s.photo_path) : [it.s.photo_path];

  // បម្លែងរូបទៅជា data URL (ដើម្បីឱ្យផ្ទាំងបោះពុម្ពមិនពឹងលើ path) ហើយប្រាប់ច្បាស់ បើរកមិនឃើញឯកសារ
  async function bgData(name) {
    const url = tBg(name);
    try {
      const r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status);
      const b = await r.blob();
      return await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(b); });
    } catch (e) {
      alert('រកមិនឃើញរូបគំរូ៖ ' + url + '\nសូមដាក់ថត "templates" (card.webp, certificate.webp, honor.webp) នៅក្បែរ index.html ហើយ Refresh (Cmd+Shift+R)');
      return null;
    }
  }
  // ---------- បោះពុម្ព ----------
  async function printDocs() {
    await loadCustom();
    const items = buildItems();
    if (!items.length) return alert(NDT);
    const sm = await signed(items.flatMap(itemPaths));
    const name = itemTpl(items[0]), pg = tPage(name), isCard = name === 'card';
    const bg = await bgData(name); if (!bg) return;
    const pages = items.map(it => pageHtml(name, it.ctx, itemPhotos(it, sm), { bg })).join('');
    const w = window.open('', '_blank');
    if (!w) return alert('Browser បានទប់ស្កាត់ផ្ទាំងថ្មី សូមអនុញ្ញាត Pop-up សិន');
    const sheet = isCard && cardLayout === 'sheet';
    const pageCss = sheet ? '@page{size:A4 portrait;margin:8mm}' : `@page{size:${pg.w}mm ${pg.h}mm;margin:0}`;
    const layoutCss = sheet
      ? `.sheet{display:flex;flex-wrap:wrap;gap:3mm;justify-content:flex-start}.sheet .pg{flex:none;outline:0.1mm dashed #bbb;break-inside:avoid}`
      : `.pg{page-break-after:always;break-after:page}.pg:last-child{page-break-after:auto}`;
    w.document.write(`<!DOCTYPE html><html lang="km"><head><meta charset="utf-8"><title>${esc(DOCS[docType].label)}</title>
<link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&display=swap" rel="stylesheet">
<style>${pageCss}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}html,body{margin:0;padding:0;background:#fff}
.root{--w:${pg.w}mm;--r:${pg.h / pg.w}}${BASE_CSS}${layoutCss}</style></head><body>
<div class="root ${sheet ? 'sheet' : ''}">${pages}</div>
<script>const fitAll=${fitAll.toString()};
(async()=>{try{await document.fonts.ready}catch(e){}
await Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,10000)})));
fitAll(document);setTimeout(()=>window.print(),400)})();<\/script></body></html>`);
    w.document.close();
  }

  // ---------- មើលជាមុន ----------
  async function showPreview() {
    await loadCustom();
    const el = gid('aw_preview'); if (!el) return;
    const items = buildItems();
    if (!items.length) { el.innerHTML = `<div class="${C.card} p-12 text-center text-slate-500">${NDT}</div>`; return; }
    const it = items[0], name = itemTpl(it), pg = tPage(name), sm = await signed(itemPaths(it));
    const wpx = Math.min(pg.w > pg.h ? 560 : 380, pg.w * 2.4);
    const bg = await bgData(name); if (!bg) return;
    el.innerHTML = `<div class="text-sm text-slate-500 mb-2">ទំព័រទី ១ ក្នុងចំណោម ${khd(items.length)} ទំព័រ</div>
      <div class="aw-prev" style="--w:${wpx}px;--r:${pg.h / pg.w};width:${wpx}px">${pageHtml(name, it.ctx, itemPhotos(it, sm), { bg })}</div>`;
    try { await document.fonts.ready; } catch (e) { /* ignore */ }
    fitAll(el);
  }

  // ---------- UI ----------
  const fld = (l, html) => `<label class="grid gap-1 text-xs font-semibold text-slate-500">${l}${html}</label>`;
  function shell() {
    return `<div id="aw_root">
      <h2 class="font-bold text-brand text-base sm:text-lg mb-3 flex items-center gap-2"><span class="w-1 h-5 bg-accent rounded"></span>ឯកសារបោះពុម្ព (admin)</h2>
      <div id="aw_err"></div><div id="aw_filters" class="${C.card} p-4 mb-3"></div><div id="aw_classes" class="${C.card} p-4 mb-3"></div>
      <div id="aw_items"></div><div id="aw_actions" class="mb-3"></div><div id="aw_preview"></div></div>`;
  }
  function draw() {
    if (!gid('aw_root')) return;
    gid('aw_err').innerHTML = err ? `<div class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">មិនអាចទាញទិន្នន័យបានទេ៖ ${esc(err)}</div>` : '';
    const tOpt = `<option value="">គ្រូទាំងអស់</option>${tOpts(fTeacher)}`;
    const shOpt = `<option value="">វេនទាំងអស់</option>${SHIFTS.map(s => `<option value="${s}" ${fShift === s ? 'selected' : ''}>វេន${s}</option>`).join('')}`;
    const monthOpts = KH_M.map((m, i) => `<option value="${i}" ${month === i ? 'selected' : ''}>ខែ${m}</option>`).join('');
    const startOpts = KH_M.map((m, i) => `<option value="${i + 1}" ${syStart === i + 1 ? 'selected' : ''}>ខែ${m}</option>`).join('');
    const qOpts = [1, 2, 3, 4].map(q => `<option value="${q}" ${quarter === q ? 'selected' : ''}>ត្រីមាសទី${khd(q)}</option>`).join('');
    const period = docType === 'honor_m'
      ? fld('ខែ', `<select id="aw_m" class="${C.input}">${monthOpts}</select>`) + fld('ឆ្នាំ', `<input id="aw_y" type="number" value="${year}" class="${C.input}">`)
      : docType === 'card' ? ''
        : fld('ត្រីមាស', `<select id="aw_q" class="${C.input}">${qOpts}</select>`) + fld('ឆ្នាំសិក្សាចាប់ផ្តើមនៅឆ្នាំ', `<input id="aw_sy" type="number" value="${sy}" class="${C.input}">`) + fld('ឆ្នាំសិក្សាចាប់ផ្តើមខែ', `<select id="aw_sm" class="${C.input}">${startOpts}</select>`);
    const extra = (docType === 'honor_m' || docType === 'honor_q') ? fld('ទីតាំង (ក្នុងប្រអប់)', `<input id="aw_loc" value="${esc(location_)}" placeholder="ឧ. ជៅរ៍" class="${C.input}">`)
      : docType === 'cert_q' ? fld('ចំណាត់ថ្នាក់ទី ១ ដល់', `<input id="aw_top" type="number" min="1" max="50" value="${topN}" class="${C.input}">`) : fld('ប្រភេទបោះពុម្ព', `<select id="aw_lay" class="${C.input}"><option value="sheet" ${cardLayout === 'sheet' ? 'selected' : ''}>ច្រើនកាតក្នុង A4 មួយសន្លឹក</option><option value="single" ${cardLayout === 'single' ? 'selected' : ''}>១កាត ក្នុងមួយទំព័រ (54×85 មម)</option></select>`);
    const dates = docType === 'card' ? '' : fld('កាលបរិច្ឆេទ (គ្រិស្តសករាជ)', `<input id="aw_gd" type="date" value="${esc(gdate)}" class="${C.input}">`) + fld('ថ្ងៃខែចន្ទគតិ (វាយដោយដៃ)', `<input id="aw_lun" value="${esc(lunar)}" placeholder="ថ្ងៃសុក្រ ៥កើត ខែអស្សុជ ឆ្នាំមមី ..." class="${C.input}">`);
    gid('aw_filters').innerHTML = `<div class="flex flex-wrap gap-2 mb-3">${Object.keys(DOCS).map(k => `<button type="button" data-dt="${k}" class="aw-chip ${docType === k ? 'on' : ''}">${DOCS[k].label}</button>`).join('')}</div>
      <div class="aw-bar">${fld('គ្រូ', `<select id="aw_t" class="${C.input}">${tOpt}</select>`)}${fld('វេន', `<select id="aw_s" class="${C.input}">${shOpt}</select>`)}${period}${extra}${dates}</div>`;

    // ថ្នាក់
    const vc = visibleClasses();
    gid('aw_classes').innerHTML = loading ? `<div class="text-center text-slate-500 p-6">កំពុងទាញទិន្នន័យ...</div>`
      : !vc.length ? `<div class="text-center text-slate-500 p-6">${NDT}</div>`
        : `<div class="text-sm font-semibold text-brand mb-2">ជ្រើសថ្នាក់ ហើយបំពេញ "កម្រិត" និង "ឈ្មោះវគ្គ" (រក្សាទុកក្នុងប្រព័ន្ធ ប្រើរួមជាមួយតារាងលទ្ធផល)</div>
        <div style="overflow-x:auto"><table class="aw-tbl"><thead><tr><th></th><th>គ្រូ</th><th>វេន</th><th>សិស្ស</th><th>កម្រិត</th><th>ឈ្មោះវគ្គ / ចំណងជើងរង</th>${docType === 'card' ? '' : '<th>ស្ថានភាព</th>'}</tr></thead><tbody>
        ${vc.map(c => { const st = setting(c); const st2 = docType === 'card' ? '' : (() => { const r = rankClass(c).filter(x => x.rank !== null).length; return `<td>${r ? 'មានលទ្ធផល ' + khd(r) + ' នាក់' : `<span style="color:#94a3b8;font-size:12px">${NDT}</span>`}</td>`; })();
          return `<tr><td><input type="checkbox" data-cls="${esc(c.key)}" ${offClass.has(c.key) ? '' : 'checked'}></td><td>${esc(tname(c.tid))}</td><td>${c.shift ? 'វេន' + esc(c.shift) : '—'}</td><td>${khd(c.students.length)}</td>
          <td><input data-cs="level" data-ck="${esc(c.key)}" value="${esc(st.level || '')}" class="${C.input}" style="min-width:70px;width:90px"></td>
          <td><input data-cs="subtitle" data-ck="${esc(c.key)}" value="${esc(st.subtitle || '')}" placeholder="ឧ. We Start English For Kids Level 1" class="${C.input}" style="min-width:220px"></td>${st2}</tr>`; }).join('')}</tbody></table></div>`;

    // បញ្ជីសិស្ស (ប័ណ្ណសរសើរ / កាត)
    const it = gid('aw_items');
    if (!loading && data && (docType === 'card' || docType === 'cert_q')) {
      const list = [];
      activeClasses().forEach(c => {
        if (docType === 'card') c.students.forEach(s => list.push({ s, c, extra: code(s) }));
        else rankClass(c).filter(r => r.rank !== null && r.rank <= topN).sort((a, b) => a.rank - b.rank).forEach(r => list.push({ s: r.s, c, extra: 'ចំណាត់ថ្នាក់ទី ' + khd(r.rank) + ' · មធ្យម ' + r.avg.toFixed(2) }));
      });
      it.innerHTML = `<div class="${C.card} p-4 mb-3"><div class="text-sm font-semibold text-brand mb-2">សិស្ស ${khd(list.filter(x => !offStu.has(String(x.s.id))).length)}/${khd(list.length)} នាក់ត្រូវបោះពុម្ព ${list.length ? '' : '· ' + NDT}</div>
        <div style="max-height:260px;overflow:auto"><table class="aw-tbl"><tbody>${list.map(x => `<tr><td style="width:32px"><input type="checkbox" data-stu="${x.s.id}" ${offStu.has(String(x.s.id)) ? '' : 'checked'}></td><td>${esc(x.s.name)}</td><td style="color:#64748b">${esc(x.c.shift ? 'វេន' + x.c.shift : '')}</td><td style="color:#64748b">${esc(x.extra)}</td></tr>`).join('')}</tbody></table></div></div>`;
    } else it.innerHTML = '';

    gid('aw_actions').innerHTML = `<div class="flex flex-wrap gap-2">
      <button type="button" data-a="prev" class="${C.ghost} !py-2.5">មើលជាមុន</button>
      <button type="button" data-a="print" class="bg-brand text-white rounded-xl px-4 py-2.5 hover:brightness-110 active:scale-95 transition font-semibold text-sm shadow-sm">បោះពុម្ព / រក្សាទុកជា PDF</button>
      <button type="button" data-a="edit" class="${C.ghost} !py-2.5 bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100">កែ / ប្តូរគម្រូ (${esc(DEFAULTS[DOCS[docType].tpl].label)})</button></div>`;
  }

  async function saveSetting(key, field, value) {
    const c = data.classes.find(x => x.key === key); if (!c) return;
    const cur = { ...(data.settings.get(key) || {}), teacher_id: c.tid, shift: c.shift || '' };
    cur[field] = value; data.settings.set(key, cur);
    const row = { teacher_id: c.tid, shift: c.shift || '', level: cur.level || '', subtitle: cur.subtitle || '' };
    if (cur.fmt) row.fmt = cur.fmt;
    const { error } = await sb.from(T_CS).upsert(row, { onConflict: 'teacher_id,shift' });
    if (error) alert('រក្សាទុកមិនបានទេ: ' + error.message + hint(error));
  }

  function bind() {
    const root = gid('aw_root');
    root.onclick = async e => {
      const dt = e.target.closest('[data-dt]');
      if (dt) { docType = dt.dataset.dt; offStu.clear(); gid('aw_preview').innerHTML = ''; draw(); return loadData(false); }
      const b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'prev') await showPreview();
      else if (b.dataset.a === 'print') await printDocs();
      else if (b.dataset.a === 'edit') await openEditor(DOCS[docType].tpl);
    };
    root.onchange = async e => {
      const t = e.target, d = t.dataset;
      if (d.cls !== undefined) { t.checked ? offClass.delete(d.cls) : offClass.add(d.cls); return draw(); }
      if (d.stu !== undefined) { t.checked ? offStu.delete(d.stu) : offStu.add(d.stu); return draw(); }
      if (d.cs) return saveSetting(d.ck, d.cs, t.value.trim());
      const id = t.id;
      if (id === 'aw_t') { fTeacher = t.value; offClass.clear(); offStu.clear(); draw(); return loadData(false); }
      if (id === 'aw_s') { fShift = t.value; return draw(); }
      if (id === 'aw_m') { month = Number(t.value); draw(); return loadData(false); }
      if (id === 'aw_y') { year = Number(t.value) || year; draw(); return loadData(false); }
      if (id === 'aw_q') { quarter = Number(t.value); draw(); return loadData(false); }
      if (id === 'aw_sy') { sy = Number(t.value) || sy; draw(); return loadData(false); }
      if (id === 'aw_sm') { syStart = Number(t.value); lsSet('csi_res_sm', String(syStart)); draw(); return loadData(false); }
      if (id === 'aw_top') { topN = Math.max(1, Number(t.value) || 5); return draw(); }
      if (id === 'aw_gd') { gdate = t.value; return; }
      if (id === 'aw_lay') { cardLayout = t.value; return; }
    };
    root.oninput = e => {
      const id = e.target.id;
      if (id === 'aw_loc') { location_ = e.target.value; lsSet('csi_docs_loc', location_); }
      else if (id === 'aw_lun') { lunar = e.target.value; lsSet('csi_docs_lunar', lunar); }
    };
  }

  // =====================================================================
  //  កម្មវិធីកែគម្រូ
  // =====================================================================
  const SAMPLE = {
    honor: { ctx: { location: 'ជៅរ៍', period: 'ប្រចាំខែ កញ្ញា', school_year: '២០២៥-២០២៦', teacher: 'ឈ្មោះគ្រូ', lunar: 'ថ្ងៃសុក្រ ៩ពេច ខែកទ្រពទ ...', date_greg: 'ថ្ងៃទី៥ ខែតុលា ឆ្នាំ២០២៦', name1: 'សិស្ស ទី១', name2: 'សិស្ស ទី២', name3: 'សិស្ស ទី៣', name4: 'សិស្ស ទី៤', name5: 'សិស្ស ទី៥' }, photos: {} },
    cert: { ctx: { name: 'ឈ្មោះសិស្ស', gender: 'ប្រុស', dob: '០២-មីនា-២០១៧', course: 'We Start English For Kids Level 1', rank: '៣', quarter: '១', school_year: '២០២៥-២០២៦', lunar: 'ថ្ងៃសុក្រ ៥កើត ខែអស្សុជ ...', date_greg: 'ថ្ងៃទី១៦ ខែតុលា ឆ្នាំ២០២៦', teacher: 'ឈ្មោះគ្រូ' }, photos: {} },
    card: { ctx: { name: 'ឈ្មោះសិស្ស', code: 'A0080', level: '២', enrolled: '២៥-១២-២០២៥', phone: '088 43 56 218' }, photos: {} }
  };
  async function openEditor(name) {
    await loadCustom(); ensureFonts();
    const work = { fields: clone(tFields(name)), under: tUnder(name), page: (cfg[name] && cfg[name].page) || DEFAULTS[name].page, bg: blobUrl[name] || null, file: null, reset: false };
    let selId = work.fields[0] && work.fields[0].id;
    const wrap = document.createElement('div'); wrap.className = 'aw-modal'; document.body.appendChild(wrap);
    const close = () => { wrap.remove(); };
    const numIn = (k, v, step = 0.1) => `<input data-k="${k}" type="number" step="${step}" value="${v}" class="${C.input}">`;
    const redraw = (full) => {
      const pg = PAGES[work.page], wpx = pg.w > pg.h ? 460 : 340;
      const f = work.fields.find(x => x.id === selId) || work.fields[0];
      const prev = `<div class="aw-prev" style="--w:${wpx}px;--r:${pg.h / pg.w};width:${wpx}px">${pageHtml(name, SAMPLE[name].ctx, SAMPLE[name].photos, { fields: work.fields, under: work.under, bg: work.bg || (work.reset ? new URL(DEFAULTS[name].img, location.href).href : tBg(name)) })}</div>`;
      if (!full) { gid('aw_edprev').innerHTML = prev; fitAll(gid('aw_edprev')); return; }
      wrap.innerHTML = `<div class="aw-box"><div class="flex items-center gap-2 mb-3"><div class="font-bold text-brand flex-1">កែគម្រូ៖ ${esc(DEFAULTS[name].label)}</div><button type="button" data-ed="close" class="${C.ghost}">បិទ</button></div>
        <div class="aw-ed"><div><div id="aw_edprev">${prev}</div><div class="text-xs text-slate-500 mt-2">ប្រើអក្សរគំរូ ដើម្បីមើលទីតាំង។ ទិន្នន័យពិតនឹងជំនួសពេលបោះពុម្ព។ អក្សរវែងពេកនឹងបង្រួមដោយស្វ័យប្រវត្តិ។</div></div>
        <div class="grid gap-3" style="align-content:start">
          <div class="${C.card} p-3 grid gap-2"><div class="font-semibold text-sm">រូបផ្ទៃខាងក្រោយ</div>
            <input type="file" id="aw_bgf" accept="image/*" class="${C.input} text-xs">
            <div class="aw-g2">${fld('ទំហំក្រដាស', `<select data-k="page" class="${C.input}">${Object.keys(PAGES).map(k => `<option value="${k}" ${work.page === k ? 'selected' : ''}>${PAGES[k].label}</option>`).join('')}</select>`)}
              <label class="text-xs font-semibold text-slate-500 flex items-center gap-2" style="margin-top:20px"><input type="checkbox" data-k="under" ${work.under ? 'checked' : ''}> រូបសិស្សនៅក្រោមស៊ុម (PNG/WebP ដែលមានរន្ធថ្លា)</label></div>
            <button type="button" data-ed="resetbg" class="${C.ghost} !py-2">ត្រឡប់ទៅរូបគំរូដើម</button></div>
          <div class="${C.card} p-3 grid gap-2"><div class="flex items-center gap-2"><div class="font-semibold text-sm flex-1">វាល (អក្សរ / រូបថត)</div><button type="button" data-ed="addtext" class="${C.ghost} !py-1 !px-3">+ អក្សរ</button></div>
            <select data-k="sel" class="${C.input}">${work.fields.map(x => `<option value="${esc(x.id)}" ${f && f.id === x.id ? 'selected' : ''}>${esc(x.label || x.id)}</option>`).join('')}</select>
            ${f ? (f.kind === 'text' ? `
              ${fld('អត្ថបទ  (' + esc(DEFAULTS[name].tokens) + ')', `<input data-f="text" value="${esc(f.text)}" class="${C.input}">`)}
              <div class="aw-g2">${fld('ទីតាំងឆ្វេង X %', numIn('f:x', f.x))}${fld('ទីតាំងកណ្តាល Y %', numIn('f:y', f.y))}${fld('ទទឹង %', numIn('f:w', f.w))}${fld('ទំហំអក្សរ', numIn('f:size', f.size))}</div>
              <div class="aw-g2">${fld('ពណ៌', `<input data-f="color" type="color" value="${esc(f.color)}" class="${C.input}" style="padding:2px;height:38px">`)}${fld('ពណ៌បន្លិច (*អក្សរ*)', `<input data-f="accent" type="color" value="${esc(f.accent || '#d32f2f')}" class="${C.input}" style="padding:2px;height:38px">`)}
                ${fld('ពុម្ពអក្សរ', `<select data-f="font" class="${C.input}"><option value="moul" ${f.font === 'moul' ? 'selected' : ''}>Moul (ក្បាលអក្សរ)</option><option value="body" ${f.font === 'body' ? 'selected' : ''}>Battambang (អត្ថបទ)</option><option value="en" ${f.font === 'en' ? 'selected' : ''}>Times (អង់គ្លេស)</option></select>`)}
                ${fld('តម្រឹម', `<select data-f="align" class="${C.input}"><option value="left" ${f.align === 'left' ? 'selected' : ''}>ឆ្វេង</option><option value="center" ${f.align === 'center' ? 'selected' : ''}>កណ្តាល</option><option value="right" ${f.align === 'right' ? 'selected' : ''}>ស្តាំ</option></select>`)}</div>
              <label class="text-xs font-semibold text-slate-500 flex items-center gap-2"><input type="checkbox" data-f="bold" ${f.bold ? 'checked' : ''}> ដិត</label>
              <button type="button" data-ed="del" class="${C.ghost} !py-1 text-red-700 border-red-300">លុបវាលនេះ</button>`
              : `<div class="aw-g2">${fld('ឆ្វេង X %', numIn('f:x', f.x))}${fld('លើ Y %', numIn('f:y', f.y))}${fld('ទទឹង %', numIn('f:w', f.w))}${fld('កម្ពស់ %', numIn('f:h', f.h))}</div>
              ${fld('រាង', `<select data-f="shape" class="${C.input}"><option value="rect" ${f.shape === 'rect' ? 'selected' : ''}>ចតុកោណ</option><option value="circle" ${f.shape === 'circle' ? 'selected' : ''}>រង្វង់</option></select>`)}`) : ''}</div>
          <div class="flex gap-2 flex-wrap"><button type="button" data-ed="save" class="bg-brand text-white rounded-xl px-4 py-2.5 font-semibold text-sm">រក្សាទុកគម្រូ</button>
            <button type="button" data-ed="defaults" class="${C.ghost}">ត្រឡប់វាល និងទីតាំងទៅលំនាំដើម</button></div>
        </div></div></div>`;
    };
    redraw(true);
    wrap.onclick = async e => {
      const b = e.target.closest('[data-ed]'); if (!b) { if (e.target === wrap) close(); return; }
      const a = b.dataset.ed;
      if (a === 'close') close();
      else if (a === 'resetbg') { work.bg = null; work.file = null; work.reset = true; work.under = DEFAULTS[name].under; redraw(true); }
      else if (a === 'defaults') { work.fields = clone(DEFAULTS[name].fields); work.page = DEFAULTS[name].page; selId = work.fields[0].id; redraw(true); }
      else if (a === 'addtext') { const id = 'x' + Date.now().toString(36); work.fields.push(T(id, 'អក្សរថ្មី', 'អក្សរថ្មី', 10, 10, 30, 2, { color: '#000000', font: 'body' })); selId = id; redraw(true); }
      else if (a === 'del') { work.fields = work.fields.filter(x => x.id !== selId); selId = work.fields[0] && work.fields[0].id; redraw(true); }
      else if (a === 'save') {
        cfg[name] = { fields: work.fields, under: work.under, page: work.page };
        try {
          if (work.file) { await idb.set(name, work.file); if (blobUrl[name]) URL.revokeObjectURL(blobUrl[name]); blobUrl[name] = URL.createObjectURL(work.file); }
          else if (work.reset) { await idb.del(name); if (blobUrl[name]) URL.revokeObjectURL(blobUrl[name]); delete blobUrl[name]; }
        } catch (er) { alert('រក្សាទុករូបផ្ទៃខាងក្រោយមិនបានទេ: ' + er.message); }
        saveCfg(); close(); alert('រក្សាទុកគម្រូរួចរាល់');
      }
    };
    wrap.onchange = e => {
      const t = e.target;
      if (t.id === 'aw_bgf') { const f = t.files[0]; if (!f) return; work.file = f; work.reset = false; work.bg = URL.createObjectURL(f); if (!/png|webp/.test(f.type)) work.under = false; return redraw(true); }
      const k = t.dataset.k, fk = t.dataset.f, f = work.fields.find(x => x.id === selId);
      if (k === 'sel') { selId = t.value; return redraw(true); }
      if (k === 'page') { work.page = t.value; return redraw(true); }
      if (k === 'under') { work.under = t.checked; return redraw(false); }
      if (k && k.startsWith('f:') && f) { f[k.slice(2)] = Number(t.value); return redraw(false); }
      if (fk && f) { f[fk] = t.type === 'checkbox' ? t.checked : t.value; redraw(false); }
    };
    wrap.oninput = e => {
      const t = e.target, f = work.fields.find(x => x.id === selId);
      if (t.dataset.k && t.dataset.k.startsWith('f:') && f) { f[t.dataset.k.slice(2)] = Number(t.value); redraw(false); }
      else if (t.dataset.f && f && (t.dataset.f === 'text' || t.type === 'color')) { f[t.dataset.f] = t.value; redraw(false); }
    };
  }

  // ---------- Tab + render ----------
  function injectTab() {
    const nav = document.querySelector('#app nav > div');
    if (!nav || !isAdmin()) return;
    let b = gid('tab-docs');
    if (!b) {
      b = document.createElement('button'); b.id = 'tab-docs'; b.textContent = 'ឯកសារបោះពុម្ព';
      b.className = 'px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap flex-none';
      const after = gid('tab-honor') || gid('tab-results') || gid('tab-roster');
      if (after) after.after(b); else nav.appendChild(b);
    }
    const on = activeTab === 'docs';
    C.tabActive.split(' ').forEach(c => b.classList.toggle(c, on));
    C.tabInactive.split(' ').forEach(c => b.classList.toggle(c, !on));
    b.onclick = () => { activeTab = 'docs'; editingId = null; try { selS.clear(); } catch (e) { /* ignore */ } render(); };
  }
  const _render = window.render;
  window.render = function () {
    _render();
    injectTab();
    if (activeTab !== 'docs') return;
    const main = document.querySelector('#app main');
    if (!main) return;
    if (!isAdmin()) { main.innerHTML = `<div class="${C.card} p-12 text-center text-slate-500">សម្រាប់ admin ប៉ុណ្ណោះ</div>`; return; }
    if (!window.RX) { main.innerHTML = `<div class="${C.card} p-12 text-center text-red-700">ត្រូវដាក់ results.js (ជំនាន់ថ្មី) មុន awards.js ក្នុង index.html</div>`; return; }
    ensureFonts();
    main.innerHTML = shell(); bind(); draw(); loadData(false);
  };
  if (typeof window !== 'undefined' && window.__AW_TEST__) window.__AW_TEST__.api = { buildItems, pageHtml, tFields, DEFAULTS, setState: o => { ({ docType, fShift, topN, quarter, month, year, sy, syStart, location_, lunar, gdate } = Object.assign({ docType, fShift, topN, quarter, month, year, sy, syStart, location_, lunar, gdate }, o)); }, loadData, getData: () => data };
})();
