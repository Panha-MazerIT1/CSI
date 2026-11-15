// ===== sw.js — Service Worker =====
// យុទ្ធសាស្ត្រ៖
//  • ឯកសាររបស់ប្រព័ន្ធ (index/app.js/...): យកពី network មុន (បានកូដថ្មីជានិច្ច) បើគ្មានអ៊ីនធឺណិតទើបប្រើ cache
//  • script/font ពី CDN: ប្រើ cache ភ្លាម ហើយធ្វើបច្ចុប្បន្នភាពនៅខាងក្រោយ
//  • Supabase (ទិន្នន័យ, ចូលប្រព័ន្ធ, រូបថត): មិន cache ទេ ដើម្បីកុំឲ្យឃើញទិន្នន័យចាស់ ឬបញ្ហាសុវត្ថិភាព
// ពេលកែឯកសារ សូមប្តូរលេខ VERSION ដើម្បីសម្អាត cache ចាស់
const VERSION = 'csi-v1';
const SHELL = [
  './', './index.html', './app.js', './photo-tools.js', './style.css',
  './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null))))   // ឯកសារណាបាត់ មិនធ្វើឲ្យទាំងមូលបរាជ័យ
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const CDN = ['cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // មិនប៉ះ Supabase ឬអ្វីផ្សេងដែលមិនស្គាល់
  if (url.hostname.endsWith('supabase.co')) return;

  // ឯកសាររបស់ប្រព័ន្ធ: network មុន
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
    );
    return;
  }

  // CDN: cache ភ្លាម + ធ្វើបច្ចុប្បន្នភាពខាងក្រោយ
  if (CDN.includes(url.hostname)) {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(res => {
          if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
