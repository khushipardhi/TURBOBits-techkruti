/* ============================================================
   FoodLink Service Worker — /service-worker.js
   Handles: Push Notifications + Offline Fallback
   ============================================================ */

const CACHE_NAME = 'foodlink-v1';
const OFFLINE_URL = '/';

// ==================== INSTALL ====================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );
  self.skipWaiting();
  console.log('[SW] Installed successfully.');
});

// ==================== ACTIVATE ====================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
  console.log('[SW] Activated and claimed clients.');
});

// ==================== FETCH (Offline fallback) ====================
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// ==================== PUSH ====================
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received.');

  let payload = {
    title: 'FoodLink',
    body: 'You have a new notification.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/',
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
      console.log('[SW] Push payload:', payload);
    } catch (e) {
      payload.body = event.data.text();
      console.warn('[SW] Push data was not JSON, using as text:', payload.body);
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: payload.url || '/' },
    actions: [{ action: 'open', title: 'Open App' }],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// ==================== NOTIFICATION CLICK ====================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.data);
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || '/',
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url === targetUrl);
        if (existing) return existing.focus();
        return self.clients.openWindow(targetUrl);
      })
  );
});
