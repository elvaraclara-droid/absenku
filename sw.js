// SEMPAJANG Service Worker v2
const CACHE_NAME = 'sempajang-v2';
const MODEL_FILES = [
  'lib/face-api.min.js',
  'models/tiny_face_detector_model-weights_manifest.json',
  'models/tiny_face_detector_model-shard1',
  'models/face_landmark_68_tiny_model-weights_manifest.json',
  'models/face_landmark_68_tiny_model-shard1',
  'models/face_recognition_model-weights_manifest.json',
  'models/face_recognition_model-shard1',
  'models/face_recognition_model-shard2'
];
// Path lokal relatif terhadap lokasi sw.js, jadi jalan di domain akar maupun subfolder
const BASE = self.registration.scope;
const STATIC_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'lib/face-api.min.js',
  BASE + 'lib/jspdf.umd.min.js',
  BASE + 'lib/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
];

// Install: cache static assets (model AI besar di-cache saat fitur wajah dipakai)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// Halaman meminta pemanasan cache model AI (agar scan wajah berikutnya cepat & bisa offline)
self.addEventListener('message', event => {
  if (event.data === 'precache-models') {
    const base = self.registration.scope;
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache =>
        Promise.allSettled(MODEL_FILES.map(f => cache.match(base + f).then(hit => hit || cache.add(base + f))))
      )
    );
  }
});

// Activate: hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Supabase API & Fonnte proxy: Network only (data realtime)
// - CDN assets + model AI (lib/, models/): Cache first
// - HTML: Network first, fallback cache
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET
  if (event.request.method !== 'GET') return;

  // Supabase & Fonnte — selalu network
  if (url.hostname.includes('supabase.co') || url.hostname.includes('fonnte.com')) {
    return;
  }

  // CDN assets & model AI lokal — cache first
  const isModel = url.origin === self.location.origin && (/\/models\//.test(url.pathname) || /\/lib\//.test(url.pathname));
  if (
    isModel ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML & lokal — network first, fallback cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
