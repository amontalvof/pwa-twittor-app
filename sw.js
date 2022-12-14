importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js',
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js',
];

self.addEventListener('install', (e) => {
    const cacheStatic = caches
        .open(STATIC_CACHE)
        .then((cache) => cache.addAll(APP_SHELL))
        .catch(console.error);
    const cacheInmutable = caches
        .open(INMUTABLE_CACHE)
        .then((cache) => cache.addAll(APP_SHELL_INMUTABLE))
        .catch(console.error);

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

// Process for each time the service worker is changed, delete the old caches
self.addEventListener('activate', (e) => {
    const response = caches.keys().then((keys) => {
        keys.forEach((key) => {
            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }

            if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                return caches.delete(key);
            }
        });
    });

    e.waitUntil(response);
});

// Cache with network fallback
self.addEventListener('fetch', (e) => {
    if (!(e.request.url.indexOf('http') === 0)) return;
    const response = caches.match(e.request).then((res) => {
        if (res) {
            return res;
        } else {
            return fetch(e.request).then((newRes) => {
                return updateDynamicCache(DYNAMIC_CACHE, e.request, newRes);
            });
        }
    });

    e.respondWith(response);
});
