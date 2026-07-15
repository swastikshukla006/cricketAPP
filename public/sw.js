const CACHE = 'ball-kho-gayi-xi-v7-push';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./manifest.json','./assets/cric-time-front.jpg','./assets/ball-kho-gayi-circle.png','./assets/logo-64.png','./assets/logo-192.png','./assets/logo-512.png','./assets/Ball-Kho-Gayi-XI-Player-Guide.pdf'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));
});


self.addEventListener('push', (event) => {
  let data = { title: 'CricCircle', body: 'You have a new cricket update.', url: '/#chat', tag: 'criccircle-update' };
  try { if (event.data) data = { ...data, ...event.data.json() }; }
  catch { if (event.data) data.body = event.data.text(); }

  const options = {
    body: data.body,
    icon: '/assets/logo-192.png',
    badge: '/assets/logo-192.png',
    tag: data.tag || 'criccircle-update',
    renotify: true,
    vibrate: [180, 80, 180],
    data: { url: data.url || '/#chat', type: data.type || 'general' },
    actions: [{ action: 'open', title: 'Open CricCircle' }]
  };
  event.waitUntil(self.registration.showNotification(data.title || 'CricCircle', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/#chat', self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        client.navigate(target);
        return client.focus();
      }
    }
    return clients.openWindow ? clients.openWindow(target) : undefined;
  }));
});
