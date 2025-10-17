// Nombre de la cache
const cacheName = 'mi-cache-v2';

// Archivos que se guardarán en cache
const cacheFiles = [
    './index.html',
    './pagina1.html',
    './pagina2.html',
    './offline.html',
    './style.css',
    './main.js',
    './icono.png'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
    console.log('SW: Instalando');
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('SW: Cacheando archivos');
            return cache.addAll(cacheFiles);
        }).then(() => self.skipWaiting())
        .catch((err) => console.log('SW: Error al cachear archivos:', err))
    );
});

// Activación del service worker
self.addEventListener('activate', (event) => {
    console.log('SW: Activado');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== cacheName) {
                        console.log(`Eliminando cache antigua: ${cache}`);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Recibir mensajes desde la página
self.addEventListener('message', (event) => {
    console.log('SW: Recibido:', event.data);
    if (event.data.action === 'mostrar-notificacion') {
        self.registration.showNotification('Notificación local', {
            body: 'Esta es una prueba de notificación sin servidor push.',
            icon: 'icono.png',
        });
    }
});


// Manejar peticiones de red con fallback offline
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('chrome-extension') || event.request.url.includes('favicon.ico')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clone = response.clone();
                caches.open(cacheName).then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((response) => {
                    if (response) {
                        console.log('SW: Recurso desde cache', event.request.url);
                        return response;
                    } else {
                        console.warn('SW: Mostrando página offline');
                        return caches.match('offline.html');
                    }
                });
            })
    );
});
