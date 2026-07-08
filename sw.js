// DayTracker Service Worker — Timer background notifications
const TIMER_KEY = 'dt_timer_end';
let scheduledVersion = 0;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

function showTimerNotification() {
  return self.registration.showNotification('DayTracker — Repos terminé ! 💪', {
    body: "C'est parti pour la prochaine série",
    icon: '/apple-touch-icon.png',
    badge: '/favicon.ico',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'daytracker-timer',
    renotify: true,
    requireInteraction: false,
  });
}

self.addEventListener('message', (event) => {
  const { type, delay, endTime } = event.data || {};

  if (type === 'SCHEDULE_TIMER') {
    scheduledVersion++;
    const myVersion = scheduledVersion;

    event.waitUntil(
      new Promise((resolve) => {
        const ms = Math.max(0, endTime - Date.now());
        setTimeout(async () => {
          if (scheduledVersion !== myVersion) { resolve(); return; }
          // Check no client is visible (app in foreground handles it itself)
          const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
          const appVisible = clients.some(c => c.visibilityState === 'visible');
          if (!appVisible) await showTimerNotification();
          resolve();
        }, ms);
      })
    );
  }

  if (type === 'CANCEL_TIMER') {
    scheduledVersion++;
  }
});

// On SW wake-up (e.g. push, sync), check if a timer expired while SW was dead
self.addEventListener('fetch', (event) => {
  // passthrough — we only use this to stay registered
});

// Tap notification → focus app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('/');
    })
  );
});
