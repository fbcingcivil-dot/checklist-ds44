const CACHE = "loto-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "../logo.png", "../icon-192.png", "../icon-512.png", "../icon-maskable-512.png", "../apple-touch-icon.png", "../jspdf.umd.min.js", "../jspdf.plugin.autotable.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("loto-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const page = e.request.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html") || url.pathname.endsWith(".webmanifest");
  const save = res => { if (res.ok && url.origin === location.origin) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return res; };
  if (page) {
    // Página: primero la red (siempre la versión nueva); sin señal, la copia guardada
    e.respondWith(fetch(e.request, {cache: "no-store"}).then(save).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(r => r || fetch(e.request).then(save).catch(() => caches.match("index.html"))));
});
