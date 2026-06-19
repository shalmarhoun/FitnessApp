self.addEventListener("push", (event) => {
  const fallback = {
    title: "FITNESS SM",
    body: "A new workout update is ready.",
    url: self.location.origin,
  };

  const readPayload = async () => {
    if (!event.data) return fallback;
    try {
      return { ...fallback, ...event.data.json() };
    } catch {
      return { ...fallback, body: event.data.text() || fallback.body };
    }
  };

  event.waitUntil(
    readPayload().then((payload) =>
      self.registration.showNotification(payload.title || fallback.title, {
        body: payload.body || fallback.body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: payload.tag || "fitness-sm-workout",
        renotify: true,
        data: {
          url: payload.url || fallback.url,
          sessionId: payload.sessionId || null,
        },
      }),
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const matchingClient = clientList.find((client) => client.url.startsWith(self.location.origin));
      if (matchingClient) {
        matchingClient.focus();
        return matchingClient.navigate(targetUrl);
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
