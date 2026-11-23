// ===== qr-login.js =====
// QR សម្រាប់ចូលប្រព័ន្ធ: admin បង្កើតគ្រូ → បង្ហាញ QR · ទំព័រចូល → ស្កេន / ផ្ទុកឡើងរូប QR
(() => {
  const loadLib = async (ok, urls) => {
    for (const u of urls) {
      if (ok()) return;
      await new Promise(r => { const el = document.createElement('script'); el.src = u; el.onload = el.onerror = r; document.head.appendChild(el); });
    }
    if (!ok()) throw new Error('library');
  };
  const ensureQr = () => loadLib(() => typeof qrcode !== 'undefined', [
    'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js', 'https://unpkg.com/qrcode-generator@1.4.4/qrcode.js']);
  const ensureJsQR = () => loadLib(() => typeof jsQR !== 'undefined', [
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js', 'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js']);

  // ---------- QR សម្រាប់ចូលប្រព័ន្ធ (បង្កើត / ស្កេន / ផ្ទុកឡើងរូប) ----------
  const QR_PREFIX = 'CSI-LOGIN:';
  function makeQrDataUrl(text) {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    const qr = qrcode(0, 'M');
    qr.addData(text); qr.make();
    return qr.createDataURL(8, 8);
  }
  function parseLoginQr(text) {
    if (!String(text).startsWith(QR_PREFIX)) return null;
    try { const o = JSON.parse(text.slice(QR_PREFIX.length)); return o.e && o.p ? { email: o.e, password: o.p } : null; } catch { return null; }
  }
  function scanImage(img, w, h, max) {
    const k = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
    c.width = Math.round(w * k); c.height = Math.round(h * k);
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0, c.width, c.height);
    return jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
  }
  async function decodeQrFile(file) {
    const bmp = await createImageBitmap(file);
    const r = scanImage(bmp, bmp.width, bmp.height, 1000);
    return r ? parseLoginQr(r.data) : null;
  }
  function openScanner(onResult) {
    const box = document.createElement('div');
    box.className = 'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4';
    box.innerHTML = `<div class="${C.card} w-full max-w-md p-4 grid gap-3"><h3 class="font-bold text-brand">ស្កេន QR ដើម្បីចូល</h3>
      <video id="sc_v" playsinline muted class="w-full rounded-xl bg-black aspect-square object-cover"></video>
      <p id="sc_m" class="text-sm text-slate-500 text-center min-h-[1.2em]">ដាក់ QR ឲ្យនៅចំពីមុខកាមេរ៉ា</p>
      <button type="button" id="sc_x" class="${C.cancel}">បិទ</button></div>`;
    document.body.appendChild(box);
    const v = box.querySelector('#sc_v'), msg = box.querySelector('#sc_m');
    let stream, stop = false;
    const close = () => { stop = true; if (stream) stream.getTracks().forEach(t => t.stop()); box.remove(); };
    box.querySelector('#sc_x').onclick = close;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(st => {
      stream = st; v.srcObject = st; v.play();
      const tick = () => {
        if (stop) return;
        if (v.readyState === v.HAVE_ENOUGH_DATA && v.videoWidth) {
          const r = scanImage(v, v.videoWidth, v.videoHeight, 640);
          if (r) {
            const cred = parseLoginQr(r.data);
            if (cred) { close(); return onResult(cred); }
            msg.textContent = 'QR នេះមិនមែនសម្រាប់ចូលប្រព័ន្ធទេ';
          }
        }
        requestAnimationFrame(tick);
      };
      tick();
    }).catch(() => { msg.textContent = 'មិនអាចបើកកាមេរ៉ាបានទេ។ សូមអនុញ្ញាតកាមេរ៉ា ឬប្រើ "ផ្ទុកឡើងរូប QR"'; });
  }
  async function qrCardPng(name, email, dataUrl) {
    const img = new Image();
    img.src = dataUrl; await img.decode();
    const c = document.createElement('canvas'), x = c.getContext('2d');
    c.width = 420; c.height = 520;
    x.fillStyle = '#fff'; x.fillRect(0, 0, 420, 520);
    x.textAlign = 'center'; x.fillStyle = '#2a3a87'; x.font = 'bold 22px Battambang, sans-serif';
    x.fillText('ប្រព័ន្ធទិន្នន័យសិស្ស', 210, 44);
    x.imageSmoothingEnabled = false; x.drawImage(img, 40, 70, 340, 340);
    x.fillStyle = '#111'; x.font = 'bold 22px Battambang, sans-serif'; x.fillText(name, 210, 452);
    x.fillStyle = '#555'; x.font = '16px sans-serif'; x.fillText(email, 210, 482);
    return c.toDataURL('image/png');
  }
  async function showTeacherQr(info) {
    try { await ensureQr(); } catch { return alert('បង្កើតគ្រូរួចហើយ ប៉ុន្តែមិនអាចផ្ទុក QR library បានទេ (ពិនិត្យអ៊ីនធឺណិត ឬ Brave Shields)'); }
    const url = makeQrDataUrl(QR_PREFIX + JSON.stringify({ e: info.email, p: info.password }));
    const box = document.createElement('div');
    box.className = 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4';
    box.innerHTML = `<div class="${C.card} w-full max-w-sm p-5 text-center grid gap-3 max-h-[92vh] overflow-auto">
      <h3 class="font-bold text-brand">បង្កើតគ្រូរួចរាល់ </h3>
      <img src="${url}" alt="QR" class="mx-auto w-64 h-64" style="image-rendering:pixelated">
      <div class="text-sm"><b>${esc(info.name)}</b><br>អ៊ីមែល៖ ${esc(info.email)}<br>ពាក្យសម្ងាត់៖ <span class="font-mono">${esc(info.password)}</span></div>
      <p class="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2">⚠ QR នេះមានពាក្យសម្ងាត់ក្នុងខ្លួន។ ផ្តល់ឲ្យគ្រូម្នាក់នោះប៉ុណ្ណោះ ហើយវានឹងមិនបង្ហាញម្តងទៀតទេ។ គ្រូអាចស្កេន ឬវាយអ៊ីមែល និងពាក្យសម្ងាត់ដោយដៃក៏បាន។</p>
      <div class="flex gap-2 justify-center"><button type="button" id="qr_dl" class="${C.btn}">ទាញយករូប QR (PNG)</button><button type="button" id="qr_x" class="${C.cancel}">បិទ</button></div></div>`;
    document.body.appendChild(box);
    box.querySelector('#qr_x').onclick = () => box.remove();
    box.querySelector('#qr_dl').onclick = async () => {
      const a = document.createElement('a');
      a.href = await qrCardPng(info.name, info.email, url);
      a.download = 'login-qr-' + info.email.split('@')[0] + '.png';
      a.click();
    };
  }

  // ---------- ទំព័រចូលប្រព័ន្ធ: ប៊ូតុងស្កេន / ផ្ទុកឡើងរូប QR ----------
  function injectLogin() {
    const f = document.getElementById('lf');
    if (!f || document.getElementById('lq_scan')) return;
    const submit = f.querySelector('button:not([type])');
    if (!submit) return;
    const row = document.createElement('div');
    row.className = 'grid grid-cols-2 gap-2';
    row.innerHTML = `<button type="button" id="lq_scan" class="${C.ghost}"> ស្កេន QR</button><label class="${C.ghost} text-center cursor-pointer"> ផ្ទុកឡើងរូប QR<input id="lq_file" type="file" accept="image/*" class="hidden"></label>`;
    submit.after(row);
    const msg = t => { const m = document.getElementById('lm'); if (m) m.textContent = t; };
    const useCred = c => { document.getElementById('em').value = c.email; document.getElementById('pw').value = c.password; f.requestSubmit(); };
    const libErr = () => msg('មិនអាចផ្ទុក jsQR បានទេ។ សូមពិនិត្យអ៊ីនធឺណិត ឬ Brave Shields');
    document.getElementById('lq_scan').onclick = async () => { try { await ensureJsQR(); } catch { return libErr(); } openScanner(useCred); };
    document.getElementById('lq_file').onchange = async e => {
      const file = e.target.files[0]; e.target.value = '';
      if (!file) return;
      try { await ensureJsQR(); } catch { return libErr(); }
      try { const c = await decodeQrFile(file); if (c) useCred(c); else msg('រកមិនឃើញ QR សម្រាប់ចូលក្នុងរូបនេះទេ'); }
      catch { msg('មិនអាចអានរូបភាពបានទេ'); }
    };
  }
  new MutationObserver(injectLogin).observe(document.getElementById('app'), { childList: true });
  injectLogin();

  // ---------- ពេល admin បង្កើតគ្រូជោគជ័យ → បង្ហាញ QR ----------
  const origRpc = sb.rpc.bind(sb);
  sb.rpc = async (fn, args, opts) => {
    const res = await origRpc(fn, args, opts);
    if (fn === 'admin_create_teacher' && !res.error && args) showTeacherQr({ name: args.p_name, email: args.p_email, password: args.p_password });
    return res;
  };
})();
