const CACHE_VERSION = 'portfolio-static-v1';
const STATIC_CACHE = `${CACHE_VERSION}-assets`;
const STATIC_ASSET_PATTERN = /\.(?:css|js|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf|eot|pdf)$/i;

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function(cacheName) {
                        return cacheName.indexOf('portfolio-static-') === 0 && cacheName !== STATIC_CACHE;
                    })
                    .map(function(cacheName) {
                        return caches.delete(cacheName);
                    })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(event) {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin || !STATIC_ASSET_PATTERN.test(url.pathname)) {
        return;
    }

    event.respondWith(
        caches.open(STATIC_CACHE).then(function(cache) {
            return cache.match(request).then(function(cachedResponse) {
                const networkResponse = fetch(request).then(function(response) {
                    if (response && response.ok) {
                        cache.put(request, response.clone());
                    }

                    return response;
                }).catch(function() {
                    return cachedResponse;
                });

                return cachedResponse || networkResponse;
            });
        })
    );
});
