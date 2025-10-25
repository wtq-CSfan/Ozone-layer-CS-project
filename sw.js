// 简化版 Service Worker
const CACHE_NAME = 'ictx-simple-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker 安装');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活');
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// 修复消息处理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // 立即响应
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({ack: true});
  }
});