const CACHE_NAME = "weight-tracker-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.png"
];


// Installation
self.addEventListener("install", event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })
    );
});


// Aktivierung: alte Cache-Versionen löschen
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(cacheNames => {

            return Promise.all(
                cacheNames.map(cache => {

                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }

                })
            );

        }).then(() => {
            return self.clients.claim();
        })
    );

});


// Dateien laden
self.addEventListener("fetch", event => {

    event.respondWith(

        fetch(event.request)
            .then(response => {

                // neue Dateien zurückgeben
                return response;

            })
            .catch(() => {

                // wenn offline: Cache benutzen
                return caches.match(event.request);

            })

    );

});
