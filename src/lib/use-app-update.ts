/**
 * In-App Update Hook
 * Checks for app updates on initialization when online
 */

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { APP_CONFIG, RemoteVersionInfo, isNewerVersion } from './app-config';

export interface UpdateState {
  checking: boolean;
  updateAvailable: boolean;
  remoteVersion: string | null;
  downloadUrl: string | null;
  error: string | null;
}

/**
 * Check if the device is online
 */
function isOnline(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // Assume online if we can't detect
}

/**
 * Check if running inside native Capacitor app
 */
function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Hook to check for app updates
 */
export function useAppUpdate() {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    updateAvailable: false,
    remoteVersion: null,
    downloadUrl: null,
    error: null,
  });
  
  const [dismissed, setDismissed] = useState(false);

  const checkForUpdate = useCallback(async () => {
    // Only check in native app context or web (for testing)
    if (!isOnline()) {
      return;
    }

    setState(prev => ({ ...prev, checking: true, error: null }));

    try {
      const response = await fetch(APP_CONFIG.versionCheckUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: RemoteVersionInfo = await response.json();
      
      const hasUpdate = isNewerVersion(APP_CONFIG.version, data.latestVersion);

      setState({
        checking: false,
        updateAvailable: hasUpdate,
        remoteVersion: data.latestVersion,
        downloadUrl: data.downloadUrl,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        checking: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, []);

  // Check for updates on mount
  useEffect(() => {
    // Small delay to let the app initialize first
    const timer = setTimeout(() => {
      checkForUpdate();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkForUpdate]);

  const dismissUpdate = useCallback(() => {
    setDismissed(true);
  }, []);

  const openDownload = useCallback(() => {
    if (!state.downloadUrl) return;

    if (isNativeApp()) {
      // In native app, use Capacitor Browser plugin or window.open
      // This will trigger the system download manager for APK
      try {
        // Try to use Capacitor Browser if available
        import('@capacitor/browser').then(({ Browser }) => {
          Browser.open({ url: state.downloadUrl! });
        }).catch(() => {
          // Fallback to window.open
          window.open(state.downloadUrl!, '_system');
        });
      } catch {
        window.open(state.downloadUrl, '_system');
      }
    } else {
      // In web, just open the URL
      window.open(state.downloadUrl, '_blank');
    }
  }, [state.downloadUrl]);

  return {
    ...state,
    showModal: state.updateAvailable && !dismissed,
    dismissUpdate,
    openDownload,
    checkForUpdate,
    currentVersion: APP_CONFIG.version,
  };
}
