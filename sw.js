const CACHE = 'seisan-cache-v25';
const FILES = [
  './',
  'index.html',
  'manifest.json',
  'seisan-icon-180.png',
  'seisan-icon-152.png',
  'seisan-icon-512.png'
];

// キャッシュ完了後に skipWaiting（順番が重要）
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// 古いキャッシュを削除してから claim
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// キャッシュ優先で応答（オフライン対応）
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached); // ネットワーク失敗時もキャッシュを返す
    })
  );
});
