/**
 * Service Worker Registration & Update Handler
 * Manages SW registration and notifies the user when updates are available
 */

interface UpdateEvent {
  type: 'SW_UPDATE_AVAILABLE' | 'SW_ACTIVATED' | 'SW_OFFLINE' | 'SW_ONLINE';
  version?: string;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateListeners: Set<(event: UpdateEvent) => void> = new Set();
  private pendingUpdate = false;
  private readonly CHECK_INTERVAL = 60000; // Check for updates every minute

  /**
   * Initialize and register the service worker
   */
  async init() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered:', this.registration);

      // Check for updates periodically
      setInterval(() => this.checkForUpdates(), this.CHECK_INTERVAL);

      // Handle updates while the page is running
      this.registration.addEventListener('updatefound', () =>
        this.handleUpdateFound()
      );

      // Handle controller changes (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.notifyUpdate('SW_ACTIVATED');
      });

      // Listen for online/offline events
      window.addEventListener('online', () => this.notifyUpdate('SW_ONLINE'));
      window.addEventListener('offline', () => this.notifyUpdate('SW_OFFLINE'));
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Check for service worker updates
   */
  private async checkForUpdates() {
    if (!this.registration) return;

    try {
      const updated = await this.registration.update();
      if (updated.installing && !this.pendingUpdate) {
        this.pendingUpdate = true;
        this.handleUpdateFound();
      }
    } catch (error) {
      console.warn('Failed to check for SW updates:', error);
    }
  }

  /**
   * Handle when a new service worker version is found
   */
  private handleUpdateFound() {
    const newWorker = this.registration?.installing;

    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New SW installed and there's a controller (not first install)
        console.log('New service worker version available');
        this.notifyUpdate('SW_UPDATE_AVAILABLE');
      }
    });
  }

  /**
   * Notify listeners about update events
   */
  private notifyUpdate(type: UpdateEvent['type']) {
    const event: UpdateEvent = { type };
    this.updateListeners.forEach((listener) => listener(event));
  }

  /**
   * Register a listener for update events
   */
  onUpdate(callback: (event: UpdateEvent) => void) {
    this.updateListeners.add(callback);
    return () => this.updateListeners.delete(callback);
  }

  /**
   * Accept the pending update (usually called when user confirms)
   */
  acceptUpdate() {
    if (!this.registration?.waiting) return;

    // Tell the waiting SW to skip waiting and take over
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    this.pendingUpdate = false;

    // After a short delay, reload the page to get the new version
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  /**
   * Manually trigger a cache clear
   */
  clearCache() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
  }

  /**
   * Get offline status
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Prefetch critical resources for offline use
   */
  async prefetchAssets(urls: string[]) {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open('checktang-v1');
      await Promise.all(
        urls.map((url) =>
          fetch(url)
            .then((response) => {
              if (response.ok) {
                cache.put(url, response.clone());
              }
            })
            .catch(() => {
              console.warn(`Failed to prefetch: ${url}`);
            })
        )
      );
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }
}

// Export singleton instance
export const swManager = new ServiceWorkerManager();

// Auto-initialize
if (typeof window !== 'undefined') {
  swManager.init();
}
