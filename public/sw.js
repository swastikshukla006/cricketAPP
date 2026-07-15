const CACHE = 'ball-kho-gayi-xi-v5-android-link';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./manifest.json','./assets/cric-time-front.jpg','./assets/ball-kho-gayi-circle.png','./assets/logo-64.png','./assets/logo-192.png','./assets/logo-512.png','./assets/Ball-Kho-Gayi-XI-Player-Guide.pdf'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));
});
