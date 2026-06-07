/**
 * Tiny IndexedDB wrapper for wallpaper images.
 *
 * Wallpapers are base64 data URLs that can easily exceed the 5MB localStorage
 * quota on Android WebView (causing QuotaExceededError). IndexedDB allows
 * hundreds of MB so we store them here instead.
 */

const DB_NAME = "checktang";
const DB_VERSION = 1;
const STORE = "kv";

const KEY_WALLPAPERS = "wallpapers";
const KEY_ACTIVE = "activeWallpaper";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openDB();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function idbSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("[idb] set failed", key, err);
  }
}

export async function loadWallpapers(): Promise<string[]> {
  const v = await idbGet<string[]>(KEY_WALLPAPERS);
  return Array.isArray(v) ? v.filter((s) => typeof s === "string").slice(0, 5) : [];
}

export async function saveWallpapers(list: string[]): Promise<void> {
  await idbSet(KEY_WALLPAPERS, list.slice(0, 5));
}

export async function loadActiveWallpaper(): Promise<string | null> {
  const v = await idbGet<string | null>(KEY_ACTIVE);
  return typeof v === "string" ? v : null;
}

export async function saveActiveWallpaper(w: string | null): Promise<void> {
  await idbSet(KEY_ACTIVE, w);
}
