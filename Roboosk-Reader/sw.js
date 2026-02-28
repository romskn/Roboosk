const CACHE = 'rb-v1.93';
const ASSETS = [
  '/Roboosk/',
  '/Roboosk/index.html',
  '/Roboosk/assets/R.png',
  '/Roboosk/assets/RI.png',
  '/Roboosk/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Don't cache external APIs
  if(url.hostname.includes('googleapis.com')) return;
  if(url.hostname.includes('jsdelivr.net')) return;
  if(url.hostname.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(resp => {
        if(resp && resp.status === 200 && resp.type === 'basic'){
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
