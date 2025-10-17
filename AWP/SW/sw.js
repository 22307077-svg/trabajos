//Nombre del cache actual
const CACHE_NAME = 'mi-app-cache-v1';

//listar los archivos que se guardaran en cache
const urlsToCache = [
    "./",//ruta de la raiz
    "./index.html",//documento raiz
    "./styles.css",//hoja de estilos
    "./app.js",//Script del cliente
    "./logo.png"//logotipo
];

//evento de instalacion(se dispara cuando se instala el SW)
self.addEventListener('install', (event) => {
    console.log("SW: Instalado");
    //event.waitUntil() asegura que la instalacion espere hasta que se complete la promise() de cachear los archivos
    event.waitUntil(
        //abrir el cache
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log("SW: Archivos cacheados");
            
            //cache.addAll() agrega todos los archivos de urlsToCache al cache final
            return cache.addAll(urlsToCache);
        })
    );
    //mostrar notificacion en sistema
    self.Registration.showNotification("Service Worker activo." ,
            {
        body: "el cache inicial se configuro correctamente.",
        icon: "logo.png"
    });
});

//evento de activacion (se dispara cuando el SW toma el control)
self.addEventListener('activate', (event) => {
    console.log("SW: Activado");
    //event.waitUntil() asegura que la activacion espere hasta que se complete la promise()
    event.waitUntil(
        //caches.keys() obtiene todos los nombres de caches almacenados
        caches.keys().then((cacheNames) => 
            //promises.all() espera a que se elimine todos los caches viejos
            Promise.all(
                cacheNames.map((cache) => {
                    //si el cache no coincide con el actual, se elimina
                    if (cache !== CACHE_NAME) {
                        console.log("SW: Cache viejo eliminado");
                        return caches.delete(cache);
                    }
                })
            )
        )
    );
});

//evento de interceptacion de peticiones para cada vez que la app pida un recurso
self.addEventListener("fetch", (event) => {
    event.respondWith(
        //caches.match() busca un recurso ya en el cache
        caches.match(event.request)
        .then((response) => {
            //si esta en cache se devuelve una copia guardada
            //si no esta en cache se hace una peticion normal a la red con fetch()
            return response || fetch(event.request);
            
        })
    );
})