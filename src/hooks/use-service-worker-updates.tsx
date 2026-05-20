/**
 * React Hook for Service Worker Update Notifications
 * Shows a toast notification when a new version is available
 */

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { swManager, type UpdateEvent } from '../lib/sw-manager';

export function useServiceWorkerUpdates() {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to SW update events
    unsubscribeRef.current = swManager.onUpdate((event: UpdateEvent) => {
      switch (event.type) {
        case 'SW_UPDATE_AVAILABLE':
          // New version is available
          toast.info('New version available! Click to update.', {
            duration: 0, // Keep until dismissed
            action: {
              label: 'Update Now',
              onClick: () => {
                toast.loading('Updating app...', { id: 'updating' });
                swManager.acceptUpdate();
              },
            },
            onDismiss: () => {
              // User dismissed without updating
            },
          });
          break;

        case 'SW_ACTIVATED':
          // New SW activated successfully
          toast.success('App updated successfully!', {
            duration: 3000,
          });
          break;

        case 'SW_OFFLINE':
          // Lost internet connection - app now runs from cache
          toast('You are now offline. Working from cached data.', {
            duration: 3000,
            icon: '📡',
          });
          break;

        case 'SW_ONLINE':
          // Regained internet connection
          toast('Back online! Syncing data...', {
            duration: 3000,
            icon: '✅',
          });
          break;
      }
    });

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    isOffline: swManager.isOffline(),
    acceptUpdate: () => swManager.acceptUpdate(),
    clearCache: () => swManager.clearCache(),
  };
}
