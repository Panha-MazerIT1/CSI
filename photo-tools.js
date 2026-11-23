// ===== photo-tools.js =====
// បន្ថែមលើ app.js (មិនបាច់កែ app.js): ទាញយក ZIP (Excel + ថត photos/), ឆែករូបថត, មើលរូបធំ
// ត្រូវដាក់ក្រោម <script src="app.js"> ក្នុង index.html
(() => {
  const $id = id => document.getElementById(id);
  // ចំណងជើងបញ្ជីនៅជួរលើ ប៊ូតុងចុះជួរក្រោម (កុំឲ្យចំណងជើងត្រូវច្របាច់)
  document.head.insertAdjacentHTML('beforeend', '<style>#app main h2.flex-1{flex:1 1 100%;min-width:0}</style>');
  const hasPh = s => !!(s.photo_path && photoUrls[s.photo_path]);
  const imgUrl = s => (hasPh(s) ? photoUrls[s.photo_path].url : null);

  // ---------- មើលរូបធំ (មានព្រួញ មុន/បន្ទាប់) ----------
  function openViewer(list, start) {
    if (!list.length) return;
    let i = start;
    const box = document.createElement('div');
    box.className = 'fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-3';
    const draw = () => {
      const s = list[i], u = imgUrl(s);
      box.innerHTML = `
        <button type="button" data-a="x" class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white text-xl">✕</button>
        <button type="button" data-a="p" class="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white text-2xl">‹</button>
        <button type="button" data-a="n" class="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white text-2xl">›</button>
        <div class="max-w-lg w-full text-center">
          ${u
            ? `<img src="${u}" alt="" class="mx-auto max-h-[70vh] max-w-full rounded-xl object-contain bg-white">`
            : `<div class="mx-auto w-64 h-64 rounded-xl border-2 border-dashed border-white/40 grid place-items-center text-white/70">គ្មានរូបថត</div>`}
          <div class="mt-3 text-white">
            <p class="text-lg font-bold">${esc(s.name)}</p>
            <p class="text-sm text-white/80">ចំណាត់ថ្នាក់ ${esc(s.class_no)} · ${esc(tname(s.teacher_id))}</p>
            <p class="text-xs text-white/60 mt-1">${khNum(i + 1)} / ${khNum(list.length)}</p>
          </div>
        </div>`;
    };
    const close = () => { document.removeEventListener('keydown', onKey); box.remove(); };
    const step = d => { i = (i + d + list.length) % list.length; draw(); };
    const onKey = e => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    box.onclick = e => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'x' || e.target === box) close();
      else if (a === 'p') step(-1);
      else if (a === 'n') step(1);
    };
    document.addEventListener('keydown', onKey);
    document.body.appendChild(box);
    draw();
  }

  // ចុចរូបតូចក្នុងតារាង/បញ្ជី → បើករូបធំ (ជំនួសការបើកផ្ទាំងថ្មី)
  document.addEventListener('click', e => {
    const img = e.target.closest && e.target.closest('#app img');
    if (!img) return;
    const src = img.getAttribute('src');
    const list = shown();
    const idx = list.findIndex(s => hasPh(s) && imgUrl(s) === src);
    if (idx < 0) return;
    e.preventDefault(); e.stopPropagation();
    openViewer(list, idx);
  }, true);

  // ---------- ឆែករូបថត (ទិដ្ឋភាពរួម + សិស្សគ្មានរូប) ----------
  let onlyMissing = false;
  function openGallery() {
    const all = shown();
    if (!all.length) return alert('មិនទាន់មានសិស្សទេ');
    const box = document.createElement('div');
    box.className = 'fixed inset-0 z-50 bg-black/40 flex p-3';
    let cur = all;
    const card = (s, idx) => {
      const u = imgUrl(s);
      return `<button type="button" data-g="${idx}" class="text-left rounded-xl border ${u ? 'border-slate-200 bg-white' : 'border-red-300 bg-red-50'} overflow-hidden hover:shadow-md transition">
        ${u ? `<img src="${u}" alt="" class="w-full aspect-square object-cover">`
            : `<div class="w-full aspect-square grid place-items-center text-red-500 text-sm">គ្មានរូបថត</div>`}
        <div class="p-2"><p class="text-sm font-semibold truncate">${esc(s.name)}</p>
        <p class="text-xs text-slate-500 truncate">${esc(s.class_no)} · ${esc(tname(s.teacher_id))}</p></div></button>`;
    };
    const draw = () => {
      const miss = all.filter(s => !hasPh(s)).length;
      cur = onlyMissing ? all.filter(s => !hasPh(s)) : all;
      box.innerHTML = `<div class="${C.card} w-full max-w-6xl max-h-[94vh] overflow-auto p-5 m-auto">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <h3 class="text-lg font-bold text-brand flex-1">ឆែករូបថត (${isQ() ? 'ប្រចាំត្រីមាស' : 'ប្រចាំខែ'})</h3>
          <span class="text-sm text-emerald-700">មានរូប ${khNum(all.length - miss)}</span>
          <span class="text-sm text-red-600">គ្មានរូប ${khNum(miss)}</span>
          <button type="button" data-m="1" class="${C.ghost}">${onlyMissing ? 'បង្ហាញទាំងអស់' : 'បង្ហាញតែគ្មានរូប'}</button>
          <button type="button" data-x="1" class="${C.cancel}">បិទ</button>
        </div>
        ${cur.length ? `<div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">${cur.map(card).join('')}</div>`
          : `<p class="text-center text-emerald-700 py-10">សិស្សទាំងអស់មានរូបថតគ្រប់គ្នា ✓</p>`}
      </div>`;
    };
    box.onclick = e => {
      if (e.target === box || e.target.closest('[data-x]')) return box.remove();
      if (e.target.closest('[data-m]')) { onlyMissing = !onlyMissing; return draw(); }
      const g = e.target.closest('[data-g]');
      if (g) openViewer(cur, +g.dataset.g);
    };
    document.body.appendChild(box);
    draw();
  }

  // ---------- ទាញយក ZIP (data.xlsx + photos/) ----------
  const safe = s => String(s).replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_').slice(0, 60) || 'student';
  let busy = false;
  async function exportZip() {
    if (busy) return;
    if (typeof JSZip === 'undefined') {
      const urls = ['https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js'];
      for (const u of urls) {
        if (typeof JSZip !== 'undefined') break;
        await new Promise(r => { const s = document.createElement('script'); s.src = u; s.onload = s.onerror = r; document.head.appendChild(s); });
      }
    }
    if (typeof JSZip === 'undefined') return alert('មិនអាចផ្ទុក JSZip បានទេ។ សូមពិនិត្យអ៊ីនធឺណិត ឬ extension ដែលបិទ script (ឧ. Brave Shields)');
    if (typeof XLSX === 'undefined') return alert('មិនទាន់ដាក់ script របស់ XLSX ក្នុង index.html ទេ');
    const rows = shown();
    if (!rows.length) return alert('មិនទាន់មានទិន្នន័យសម្រាប់ទាញយកទេ');
    busy = true;
    const btn0 = $id('zipBtn'), label = btn0 ? btn0.textContent : '';
    const setBtn = t => { const b = $id('zipBtn'); if (b) { b.textContent = t; b.disabled = busy; } };
    try {
      await loadPhotos();
      const zip = new JSZip(), photos = zip.folder('photos');
      const files = rows.map((s, i) => s.photo_path ? `${String(i + 1).padStart(3, '0')}_${safe(s.name)}.jpg` : '');
      const queue = rows.map((s, i) => [s, i]).filter(([s]) => s.photo_path);
      const total = queue.length;
      let done = 0, failed = 0;
      const worker = async () => {
        while (queue.length) {
          const [s, i] = queue.shift();
          try {
            const { data, error } = await sb.storage.from(PHOTO_BUCKET).download(s.photo_path);
            if (error || !data) throw error || new Error('download');
            photos.file(files[i], data);
          } catch (err) { console.error(err); failed++; files[i] = ''; }
          done++; setBtn(`កំពុងទាញរូប ${done}/${total}`);
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));

      setBtn('កំពុងបង្កើត ZIP...');
      const head = [...heads().slice(0, -1), 'ឈ្មោះឯកសាររូប'];
      const data = rows.map((s, i) => [
        ...(isQ()
          ? [i + 1, s.name, s.gender, s.class_no, formatKhmerDate(s.dob), s.course, tname(s.teacher_id)]
          : [i + 1, s.name, s.class_no, tname(s.teacher_id)]),
        files[i] ? 'photos/' + files[i] : ''
      ]);
      const ws = XLSX.utils.aoa_to_sheet([head, ...data]);
      ws['!cols'] = head.map((h, c) => ({ wch: Math.min(45, Math.max(String(h).length, ...data.map(r => String(r[c] ?? '').length)) + 2) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, isQ() ? 'ប្រចាំត្រីមាស' : 'ប្រចាំខែ');
      zip.file('data.xlsx', XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));

      const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (isQ() ? 'quarterly-' : 'monthly-') + new Date().toISOString().slice(0, 10) + '.zip';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);

      const noPhoto = rows.filter(s => !s.photo_path).length;
      alert(`ទាញយករួចរាល់\nរូបក្នុង ZIP: ${total - failed}\nសិស្សគ្មានរូប: ${noPhoto}` + (failed ? `\nទាញរូបមិនបាន: ${failed}` : ''));
    } catch (err) {
      console.error(err);
      alert('មិនអាចបង្កើត ZIP បានទេ: ' + err.message);
    } finally {
      busy = false; setBtn(label);
    }
  }

  // ---------- ដាក់ប៊ូតុងក្នុងរបារឧបករណ៍ (រាល់ពេល render ឡើងវិញ) ----------
  function inject() {
    const hon = $id('hon');
    if (!hon || $id('zipBtn')) return;
    hon.insertAdjacentHTML('beforebegin',
      `<button type="button" id="chkBtn" class="${C.ghost}"> ឆែករូបថត</button>` +
      `<button type="button" id="zipBtn" class="${C.ghost}">ទាញយក ZIP (ទិន្នន័យ + រូបថត)</button>`);
    $id('chkBtn').onclick = openGallery;
    $id('zipBtn').onclick = exportZip;
  }
  new MutationObserver(inject).observe(document.getElementById('app'), { childList: true });
  inject();
})();
