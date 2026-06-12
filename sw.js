var CACHE_VERSION = 'portfolio-static-v4';
var STATIC_CACHE = CACHE_VERSION + '-assets';
var STATIC_ASSET_PATTERN = /\.(?:css|js|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf|eot|pdf)$/i;

var PRECACHE_URLS = [
    './',
    'index.html',
    'css/style.css',
    'css/open-iconic-bootstrap.min.css',
    'css/animate.css',
    'css/owl.carousel.min.css',
    'css/owl.theme.default.min.css',
    'css/magnific-popup.css',
    'css/aos.css',
    'css/ionicons.min.css',
    'css/flaticon.css',
    'css/icomoon.css',
    'js/jquery-3.2.1.min.js',
    'js/popper.min.js',
    'js/bootstrap.min.js',
    'js/jquery.easing.1.3.js',
    'js/jquery.waypoints.min.js',
    'js/jquery.stellar.min.js',
    'js/owl.carousel.min.js',
    'js/jquery.magnific-popup.min.js',
    'js/aos.js',
    'js/jquery.animateNumber.min.js',
    'js/scrollax.min.js',
    'js/main.js',
    'images/elizeu-medeiros.jpg',
    'images/WhatsApp.png',
    'images/bg_1.jpg',
    'images/laravel-logo.png',
    'images/codeigniter-logo.png',
    'images/yii2-logo.png',
    'images/java.png',
    'images/spring-boot.png',
    'images/mysql-logo.png',
    'images/bootstrap-logo.png',
    'images/angular-logo.png',
    'images/ionic-logo.png',
    'images/about.jpg',
    'fonts/icomoon/icomoon.ttf',
    'fonts/ionicons/fonts/ionicons.woff2',
    'fonts/flaticon/font/Flaticon.woff'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(function(cache) {
            return cache.addAll(PRECACHE_URLS);
        }).then(function() {
            return self.skipWaiting();
        })
    );
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
    var request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    var url = new URL(request.url);
    var isPageNavigation = request.mode === 'navigate';
    var isStaticAsset = url.origin === self.location.origin && STATIC_ASSET_PATTERN.test(url.pathname);

    if (!isPageNavigation && !isStaticAsset) {
        return;
    }

    event.respondWith(
        caches.open(STATIC_CACHE).then(function(cache) {
            return cache.match(request, { ignoreSearch: true }).then(function(cachedResponse) {
                var networkResponse = fetch(request).then(function(response) {
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
