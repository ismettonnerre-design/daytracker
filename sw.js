// DayTracker Service Worker — Timer background notifications
let scheduledVersion = 0;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

function showTimerNotification() {
  return self.registration.showNotification('DayTracker — Repos terminé ! 💪', {
    body: "C'est parti pour la prochaine série !",
    icon: '/daytracker/favicon.ico',
    badge: '/daytracker/favicon.ico',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'daytracker-timer',
    renotify: true,
    requireInteraction: false,
  });
}

self.addEventListener('message', () => {});

// ── Web Push (serveur Cloudflare) ─────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch {}

  const title = data.title || 'DayTracker — Repos terminé ! 💪';
  const body  = data.body  || "C'est parti pour la prochaine série !";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: data.icon || '/daytracker/favicon.ico',
      badge: '/daytracker/favicon.ico',
      vibrate: [300, 100, 300, 100, 300],
      tag: 'daytracker-timer',
      renotify: true,
      requireInteraction: false,
    })
  );
});

// ── Tap notification → focus app ──────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('/daytracker/');
    })
  );
});

self.addEventListener('fetch', () => {});
