/**
 * App configuration for version display and remote update checks.
 * Override repo details via Vite env vars (VITE_GITHUB_OWNER, etc.).
 */

const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER ?? "bank";
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO ?? "CheckTang";
const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH ?? "main";

export const appConfig = {
  currentVersion: "1.1.0",
  appName: "เช็คตังค์",
  github: {
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
  },
  get versionCheckUrl(): string {
    return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/version.json`;
  },
} as const;

export type VersionManifest = {
  version: string;
  downloadUrl: string;
  releaseNotes?: string;
};
