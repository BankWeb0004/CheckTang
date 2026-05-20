/**
 * App Configuration
 * Central place for app version and update settings
 */

export const APP_CONFIG = {
  version: '1.1.0',
  appName: 'Check Tang',
  appNameTh: 'เช็คตังค์',
  developer: 'Dev by bank',
  
  // Remote version check URL (raw GitHub JSON)
  // User will provide the actual URL later
  versionCheckUrl: 'https://raw.githubusercontent.com/BankWeb0004/CheckTang/main/version.json',
} as const;

export interface RemoteVersionInfo {
  latestVersion: string;
  downloadUrl: string;
  releaseNotes?: string;
}

/**
 * Compare two semver version strings
 * Returns true if remoteVersion is greater than localVersion
 */
export function isNewerVersion(localVersion: string, remoteVersion: string): boolean {
  const local = localVersion.split('.').map(Number);
  const remote = remoteVersion.split('.').map(Number);
  
  for (let i = 0; i < Math.max(local.length, remote.length); i++) {
    const l = local[i] || 0;
    const r = remote[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}
