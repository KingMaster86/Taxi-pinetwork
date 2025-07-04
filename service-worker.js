const CACHE_NAME = "taxi-pi-cache-v1";
const urlsToCache = [
  "/index.html",
  "/dashboard.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js",
  "const CACHE_NAME = "taxi-pi-cache-v1";
const urlsToCache = [
  "index.html",
  "style.css",
  "manifest.json",
  "firebase.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-database-compat.js",
  // Google Maps loads dynamically, so can't cache directly
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
