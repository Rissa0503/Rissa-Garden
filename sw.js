const CACHE_NAME = "rissa-garden-pwa-v0.5.4";

const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.webmanifest",
    "./assets/garden.png",
    "./assets/garden-mobile.png",
    "./icons/favicon-32.png",
    "./icons/apple-touch-icon.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./sounds/click.mp3",
    "./sounds/confirm.mp3",
    "./sounds/counter.mp3",
    "./sounds/level-up.mp3",
    "./sounds/xp.mp3"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(APP_SHELL);
            })
            .then(function () {
                return self.skipWaiting();
            })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(
                    keys
                        .filter(function (key) {
                            return key !== CACHE_NAME;
                        })
                        .map(function (key) {
                            return caches.delete(key);
                        })
                );
            })
            .then(function () {
                return self.clients.claim();
            })
    );
});

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") return;

    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then(function (response) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, copy);
                    });
                    return response;
                })
                .catch(function () {
                    return caches.match("./index.html");
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(function (cachedResponse) {
                if (cachedResponse) return cachedResponse;

                return fetch(event.request).then(function (response) {
                    if (!response || response.status !== 200) return response;

                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, copy);
                    });
                    return response;
                });
            })
    );
});
