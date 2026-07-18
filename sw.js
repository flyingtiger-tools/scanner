// Flying Tiger Tools — Service Worker
// ⚠️ Bump CACHE_NAME à chaque déploiement (même valeur que APP_VERSION dans index.html)
const CACHE_NAME = 'ft-tools-v1.9.2';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Network-first : toujours essayer la dernière version en ligne d'abord.
// Le cache ne sert que si le réseau est indisponible (vrai mode hors-ligne).
// Ça évite le piège classique : un vieux Service Worker qui bloque les mises à jour.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
