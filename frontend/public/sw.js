const CACHE_NAME = 'corporatequiz-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Forza al service worker a activarse inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim()); // Toma control de los clientes de inmediato
});

self.addEventListener('fetch', event => {
  // Ignorar peticiones de API o que no sean GET
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
