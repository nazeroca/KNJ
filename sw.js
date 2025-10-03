var CACHE_NAME = 'KNJ-v1';
var urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './main.js',
    './kanji.json',
    './PWAimage/slime192.png',
    './PWAimage/slime512.png',
    './correct.mp3',
    './error.mp3',
    './hit.mp3',
    './option.mp3',
    './pro.mp3'
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// アクティベート処理
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response || fetch(event.request);
            })
    );
});