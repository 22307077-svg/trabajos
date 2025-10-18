self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open('v3')
        .then(cache => {
            cache.addAll([
                './',          
                './script.js',
                './rocket.jpg'
            ]);
            console.log("Assets cached.");
        })
        .catch(err => console.log("Could not cache."))
    )
});

self.addEventListener('fetch', event => {
    console.log("INTERCEPTED");

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                console.log("V3 the request: ", event.request);
                console.log("V3 got the response...", response);

             
                return response || fetch(event.request);

       

            })
            .catch(err => {
                console.log("Could not find matching request.");
                return null;
            })
    );
});


