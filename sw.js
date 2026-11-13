// Service worker: guarda só os arquivos do app (para abrir rápido e funcionar como app instalado).
// Os dados do Supabase nunca são guardados aqui; vêm sempre da rede.
const VERSAO = "alerta-milho-v7";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return; // Supabase e CDN: direto na rede
  // Rede primeiro (pega versão nova do app); se estiver sem internet, usa a cópia guardada.
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copia = r.clone();
        caches.open(VERSAO).then((c) => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});

// Notificações de ocorrências próximas
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Alerta Milho", {
    body: d.body || "Nova ocorrência registrada perto de você.",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || "ocorrencia",
    data: { url: d.url || "./?aba=ocorr" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const alvo = new URL((e.notification.data && e.notification.data.url) || "./?aba=ocorr", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
    for (const c of lista) {
      if (c.url.startsWith(self.registration.scope) && "focus" in c) { c.navigate(alvo).catch(() => {}); return c.focus(); }
    }
    return self.clients.openWindow(alvo);
  }));
});
