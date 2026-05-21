import { useCallback, useEffect, useRef, useState } from "react";
import { appConfig, type VersionManifest } from "@/lib/app-config";

const DISMISS_PREFIX = "checktang-update-dismissed";
const CHECK_INTERVAL_MS = 30 * 60 * 1000;

function parseVersion(version: string): number[] {
  return version
    .replace(/^v/i, "")
    .split(".")
    .map((part) => parseInt(part.replace(/[^0-9].*$/, ""), 10) || 0);
}

export function isNewerVersion(remote: string, current: string): boolean {
  const remoteParts = parseVersion(remote);
  const currentParts = parseVersion(current);
  const length = Math.max(remoteParts.length, currentParts.length);

  for (let i = 0; i < length; i++) {
    const remotePart = remoteParts[i] ?? 0;
    const currentPart = currentParts[i] ?? 0;
    if (remotePart > currentPart) return true;
    if (remotePart < currentPart) return false;
  }

  return false;
}

function isDismissed(version: string): boolean {
  try {
    return sessionStorage.getItem(`${DISMISS_PREFIX}-${version}`) === "1";
  } catch {
    return false;
  }
}

function markDismissed(version: string): void {
  try {
    sessionStorage.setItem(`${DISMISS_PREFIX}-${version}`, "1");
  } catch {
    // Ignore storage errors in restricted WebViews.
  }
}

async function fetchVersionManifest(): Promise<VersionManifest | null> {
  const response = await fetch(appConfig.versionCheckUrl, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as Partial<VersionManifest>;
  if (!data.version || !data.downloadUrl) return null;

  return {
    version: data.version,
    downloadUrl: data.downloadUrl,
    releaseNotes: data.releaseNotes,
  };
}

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<VersionManifest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const checkingRef = useRef(false);

  const checkForUpdate = useCallback(async () => {
    if (!navigator.onLine || checkingRef.current) return;

    checkingRef.current = true;
    setIsChecking(true);

    try {
      const manifest = await fetchVersionManifest();
      if (!manifest) return;

      const hasUpdate = isNewerVersion(manifest.version, appConfig.currentVersion);
      if (!hasUpdate || isDismissed(manifest.version)) {
        setUpdateInfo(null);
        setShowModal(false);
        return;
      }

      setUpdateInfo(manifest);
      setShowModal(true);
    } catch {
      // Network or parse errors are ignored; app stays usable offline.
    } finally {
      checkingRef.current = false;
      setIsChecking(false);
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    if (updateInfo) markDismissed(updateInfo.version);
    setShowModal(false);
  }, [updateInfo]);

  const applyUpdate = useCallback(() => {
    if (!updateInfo?.downloadUrl) return;
    window.open(updateInfo.downloadUrl, "_blank", "noopener,noreferrer");
  }, [updateInfo]);

  useEffect(() => {
    void checkForUpdate();

    const onOnline = () => void checkForUpdate();
    window.addEventListener("online", onOnline);

    const intervalId = window.setInterval(() => {
      void checkForUpdate();
    }, CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", onOnline);
      window.clearInterval(intervalId);
    };
  }, [checkForUpdate]);

  return {
    updateAvailable: Boolean(updateInfo),
    updateInfo,
    showModal,
    isChecking,
    currentVersion: appConfig.currentVersion,
    checkForUpdate,
    dismissUpdate,
    applyUpdate,
  };
}
