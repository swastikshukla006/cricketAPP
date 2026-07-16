const CACHE = 'ball-kho-gayi-xi-v12-auto-update';
const ASSETS = [
  './','./index.html','./styles.css','./css/tokens.css','./css/app-shell.css','./css/screens/home.css','./css/screens/matches.css','./css/final.css',
  './js/router.js','./js/final-ui.js','./js/production-ux.js','./app.js','./manifest.json','./game.html','./game.css','./game.js',
  './assets/cric-time-front.jpg','./assets/ball-kho-gayi-circle.png','./assets/logo-64.png','./assets/logo-192.png','./assets/logo-512.png','./assets/Ball-Kho-Gayi-XI-Player-Guide.pdf',
  './assets/ui-icons/dashboard.png','./assets/ui-icons/matches.png','./assets/ui-icons/squad.png','./assets/ui-icons/link.png','./assets/ui-icons/profile.png',
  './assets/ui-icons/live.png','./assets/ui-icons/trophy.png','./assets/ui-icons/team.png','./assets/ui-icons/players.png','./assets/ui-icons/settings.png',
  './assets/ui-icons/schedule.png','./assets/ui-icons/stats.png','./assets/ui-icons/game.png','./assets/ui-icons/cricket.png','./assets/ui-icons/mobile-check.png',
  './assets/ui-icons/edit-profile.png','./assets/ui-icons/replay.png','./assets/ui-icons/web.png','./assets/ui-icons/rewards.png','./assets/ui-icons/leadership.png'
];

self.addEventListener('install', (event) => event.waitUntil(
  caches.open(CACHE)
    .then((cache) => cache.addAll(ASSETS))
    .then(() => self.skipWaiting())
));

self.addEventListener('activate', (event) => event.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim())
    .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
    .then((windows) => windows.forEach((client) => client.postMessage({ type: 'APP_UPDATED', cache: CACHE })))
));

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).pathname.startsWith('/api/')) return;
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'Ball Kho Gayi XI', body: 'You have a new cricket update.', url: '/#/chat', tag: 'criccircle-update' };
  try { if (event.data) data = { ...data, ...event.data.json() }; }
  catch { if (event.data) data.body = event.data.text(); }

  const options = {
    body: data.body,
    icon: '/assets/logo-192.png',
    badge: '/assets/logo-192.png',
    tag: data.tag || 'criccircle-update',
    renotify: true,
    vibrate: [180, 80, 180],
    data: { url: data.url || '/#/chat', type: data.type || 'general' },
    actions: [{ action: 'open', title: 'Open app' }]
  };
  event.waitUntil(self.registration.showNotification(data.title || 'Ball Kho Gayi XI', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/#/chat', self.location.origin).href;
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
