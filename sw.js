/* ApiDiario — service worker
   Se pubblichi una nuova versione dell'app, cambia il numero qui sotto
   (es. apidiario-v6): forza l'aggiornamento della copia offline. */
const CACHE = "apidiario-v5";
const FILES = ["./", "./index.html", "./manifest.json",
               "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    /* pagina principale: prima la rete (così ricevi gli aggiornamenti),
       se sei senza campo usa la copia offline */
    e.respondWith(
      fetch(e.request)
        .then(r => { caches.open(CACHE).then(c => c.put("./index.html", r.clone())); return r; })
        .catch(() => caches.match("./index.html"))
    );
  } else {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
  }
});
