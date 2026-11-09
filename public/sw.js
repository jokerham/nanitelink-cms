const cacheName = 'nanitelink-offline-v1'
const offlinePage = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.add(offlinePage)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith('nanitelink-offline-') && key !== cacheName)
      .map((key) => caches.delete(key)),
  )))
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.mode !== 'navigate' || request.method !== 'GET' ||
      new URL(request.url).origin !== self.location.origin) return

  event.respondWith(fetch(request).catch(async () => (
    (await (await caches.open(cacheName)).match(offlinePage)) ?? Response.error()
  )))
})
