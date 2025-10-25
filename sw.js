// Service Worker for ICTx Device Tracker
const CACHE_NAME = 'ictx-device-tracker-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js'
];

// 安装阶段
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 缓存核心文件');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] 安装完成');
        return self.skipWaiting();
      })
  );
});

// 激活阶段
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] 激活完成');
      return self.clients.claim();
    })
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  // 只处理GET请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 如果有缓存，返回缓存版本
        if (cachedResponse) {
          return cachedResponse;
        }

        // 否则从网络获取
        return fetch(event.request)
          .then((response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应以进行缓存
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // 网络失败时，对于导航请求返回首页
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('离线模式');
          });
      })
  );
});

// 监听消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[Service Worker] 加载完成');