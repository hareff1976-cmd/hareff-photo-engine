const PREFIX = 'hareff-pages:' + self.registration.scope + ':';
const CACHE = PREFIX + 'hv-one-1.2-pages2';
const ASSETS = [
  './index.html',
  './studio.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS.map(a=>new Request(new URL(a,self.registration.scope),{cache:'reload'})))).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys
      .filter(k => k.startsWith(PREFIX) && k !== CACHE)
      .map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const scope = new URL(self.registration.scope);
  if (u.origin !== scope.origin ||
      !u.pathname.startsWith(scope.pathname)) return;
  const path = u.pathname === scope.pathname
    ? new URL('./index.html', scope).pathname
    : u.pathname;
  const known = ASSETS.find(a =>
    new URL(a, scope).pathname === path);
  if (known) e.respondWith(
    caches.open(CACHE)
      .then(c => c.match(new URL(known, scope).href))
      .then(r => r || fetch(e.request))
  );
});
