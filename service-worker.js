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
            .catch(err => {
                console.log("Cache Fehler:", err);
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
                        console.log("Alten Cache gelöscht:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Dateien laden - OPTIMIERT FÜR GITHUB
self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Nur erfolgreiche Antworten cachen
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Wenn offline: Cache benutzen
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Fallback für nicht gecachte Dateien
                        return new Response("Offline - Datei nicht verfügbar", {
                            status: 404,
                            statusText: "Not Found"
                        });
                    });
            })
    );
});
