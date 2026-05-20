/**
 * CheckTang Service Worker - Stale-While-Revalidate Strategy
 * 
 * This service worker implements a "stale-while-revalidate" caching strategy:
 * - Offline: Load instantly from cache (never show blank screen)
 * - Online: Serve from cache immediately, check for updates in background
 * - Auto-update: New versions detected during revalidation are cached for next load
 */

const CACHE_NAME = 'checktang-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Files that must always be cached (core app files)
const ALWAYS_CACHE = [
  '/index.html',
];

// Patterns for files that should use network-first strategy
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\.json$/, // JSON files (except in /assets)
];

// Patterns for assets that should use cache-first strategy
const CACHE_FIRST_PATTERNS = [
  /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp)$/,
  /^\/assets\//,
  /^\/icons\//,
];

/**
 * Install event - cache essential files during installation
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Failed to cache some assets during install:', err);
      });
    })
  );
  self.skipWaiting();
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch event - implement stale-while-revalidate strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Determine strategy based on resource type
  if (shouldUseNetworkFirst(url)) {
    event.respondWith(networkFirst(request));
  } else if (shouldUseCacheFirst(url)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

/**
 * Stale-While-Revalidate Strategy (default)
 * - Serve from cache immediately if available
 * - Fetch from network in background to update cache
 * - If cache miss and offline, fail gracefully
 */
async function staleWhileRevalidate(request) {
  const cacheName = CACHE_NAME;
  const cached = await caches.match(request);

  // Create fetch promise to update cache in background
  const fetchPromise = fetch(request)
    .then((response) => {
      // Only cache successful responses
      if (!response || response.status !== 200 || response.type === 'error') {
        return response;
      }

      const responseToCache = response.clone();
      caches.open(cacheName).then((cache) => {
        cache.put(request, responseToCache);
      });

      return response;
    })
    .catch((err) => {
      console.warn('Fetch failed for', request.url, err);
      // If fetch fails and we have cached version, it will be served below
      throw err;
    });

  // Return cached response if available, otherwise wait for network
  return cached || fetchPromise;
}

/**
 * Network-First Strategy
 * - Try network first for up-to-date data
 * - Fall back to cache if network fails
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      // Cache successful responses
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, response.clone());
      });
    }
    return response;
  } catch (err) {
    console.warn('Network request failed for', request.url, 'using cache');
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw err;
  }
}

/**
 * Cache-First Strategy
 * - Serve from cache if available
 * - Fall back to network
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, response.clone());
      });
    }
    return response;
  } catch (err) {
    console.warn('Cache miss and network unavailable for', request.url);
    throw err;
  }
}

/**
 * Determine if resource should use network-first strategy
 */
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

/**
 * Determine if resource should use cache-first strategy
 */
function shouldUseCacheFirst(url) {
  return CACHE_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

/**
 * Message handler for cache updates from the client
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((name) => caches.delete(name));
    });
  }
});
