// service-worker.js
const STATIC_CACHE = 'sw4-static-v1';
const DYNAMIC_CACHE = 'sw4-dynamic-v1';
const cacheAssets = [
  './',
  'index.html',
  'pagina1.html',
  'pagina2.html',
  'pagina3.html',
  'style.css',
  'style2.css',
  'style3.css',
  'style4.css',
  'main.js',
  'plugins.js',
  'plugins2.js',
  'plugins3.js',
  'plugins4.js',
  'animations.js',
  'animations2.js',
  'animations3.js',
  'animations4.js',
  'cursor-effect.js',
  'c69a7df8-gp0stqf5i_medium_res-2100x0-c-default.webp',
  'consecuencias-cambio-climatico-3-2100x0-c-default.webp',
  'GP0STTA6R_Medium_res-500x0-c-default.webp',
  'GPES20150426AR0001-X2-500x0-c-default.jpg',
  'Repsol-scaled-500x0-c-default.webp',
  'sequia_destroyers_ep-500x0-c-default.webp',
  'sequia.jpg',
  'logo.png',
  'global.png'
  
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(cacheAssets))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // limpio caches antiguos
      const keys = await caches.keys();
      await Promise.all(keys.map(k => {
        if (k !== STATIC_CACHE && k !== DYNAMIC_CACHE) return caches.delete(k);
      }));
      await self.clients.claim();
    })()
  );
});

// network-first, fallback a cache, y guarda en cache dinámico las respuestas de la red
self.addEventListener('fetch', event => {
  const req = event.request;

  // solo estrategias para GET
  if (req.method !== 'GET') return;

  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(req);
        // guarda copia en cache dinámico (si es válida)
        const cache = await caches.open(DYNAMIC_CACHE);
        // clonar respuesta porque cuerpo solo se puede consumir una vez
        cache.put(req, networkResponse.clone().catch(()=>{}));
        return networkResponse;
      } catch (err) {
        // fallo de red -> buscar en caches
        const cached = await caches.match(req);
        if (cached) return cached;

        // si es navegación (document), devolver index.html cacheado (SPA fallback)
        if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
          const fallback = await caches.match('index.html');
          if (fallback) return fallback;
        }
        // si no hay nada, devolver un Response de error
        return new Response('Offline and no cache', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});

// manejar clicks en notificaciones (abre la página)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : 'index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.endsWith(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
