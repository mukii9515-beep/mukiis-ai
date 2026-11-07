const CACHE_NAME = "mukii-ai-v1";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);

    if (url.origin === self.location.origin &&
        url.pathname.startsWith("/api/")) {
        return;
    }

    if (event.request.method === "GET" &&
        url.origin === self.location.origin) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    }
});