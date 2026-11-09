// Offline-Unterstützung: HTML immer zuerst aus dem Netz (damit Updates ankommen), sonst aus dem Cache.
const CACHE = 'hexland-v2';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/hexland/', '/hexland/index.html'])));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  const fromNet = () =>
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    });
  e.respondWith(
    isPage
      ? fromNet().catch(() => caches.match('/hexland/index.html'))
      : caches.match(e.request).then((hit) => hit || fromNet()),
  );
});
