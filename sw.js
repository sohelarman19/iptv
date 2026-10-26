const CACHE='bangla-iptv-v1';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const HLS='https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(async c=>{
    await c.addAll(SHELL);
    try{await c.add(HLS)}catch(_){}
  }).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET')return;
  // Only the app shell and hls.js are handled here; streams, playlists and logos go straight to the network.
  if(url.origin===location.origin){
    e.respondWith(
      fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r})
        .catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
    );
  }else if(req.url===HLS){
    e.respondWith(caches.match(req).then(r=>r||fetch(req)));
  }
});
