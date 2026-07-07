const CACHE_NAME = 'productive-cache-v1';

// Install event - skip waiting to activate immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, falling back to cache
self.addEventListener('fetch', (e) => {
  // Bypass Firestore database and Auth network queries - Firebase has its own offline persistence
  if (
    e.request.url.includes('firestore.googleapis.com') ||
    e.request.url.includes('identitytoolkit.googleapis.com') ||
    e.request.url.includes('securetoken.googleapis.com') ||
    e.request.url.includes('firebase')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful GET responses from our own origin
        if (
          e.request.method === 'GET' &&
          res.status === 200 &&
          e.request.url.startsWith(self.location.origin)
        ) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return res;
      })
      .catch(() => {
        // If network fails, serve from cache
        return caches.match(e.request);
      })
  );
});
