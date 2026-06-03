import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type AssetsBinding = {
  fetch: (request: Request) => Promise<Response>;
};

type Env = {
  ASSETS?: AssetsBinding;
};

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// Static asset extensions that should always be served by the ASSETS binding
const STATIC_ASSET_PATTERN = /\.[a-zA-Z0-9]+$/;
const KNOWN_ASSET_PREFIXES = ["/assets/", "/icons/"];
const KNOWN_ASSET_FILES = new Set([
  "/manifest.json",
  "/sw.js",
  "/favicon.ico",
  "/robots.txt",
  "/_routes.json",
]);

function looksLikeStaticAsset(pathname: string): boolean {
  if (KNOWN_ASSET_FILES.has(pathname)) return true;
  if (KNOWN_ASSET_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // Any path with a file extension (e.g. .png, .css, .js, .woff2)
  return STATIC_ASSET_PATTERN.test(pathname);
}

async function serveIndexHtml(assets: AssetsBinding, request: Request): Promise<Response> {
  const url = new URL(request.url);
  url.pathname = "/index.html";
  const indexRequest = new Request(url.toString(), {
    method: "GET",
    headers: request.headers,
  });
  return assets.fetch(indexRequest);
}

export default {
  async fetch(request: Request, env: Env, ctx: unknown) {
    const url = new URL(request.url);
    const assets = env?.ASSETS;

    // 1. Static assets — serve directly from the ASSETS binding
    if (assets && looksLikeStaticAsset(url.pathname)) {
      try {
        const assetResponse = await assets.fetch(request);
        if (assetResponse.status !== 404) return assetResponse;
      } catch (error) {
        console.error("ASSETS.fetch error:", error);
      }
      // fall through if asset missing
    }

    // 2. App / API routes — let the server handle them
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);

      // 3. SPA fallback — if the server can't match the route and we have ASSETS,
      // serve index.html so the client-side router can take over.
      if (response.status === 404 && assets && !url.pathname.startsWith("/api/")) {
        try {
          const indexResponse = await serveIndexHtml(assets, request);
          if (indexResponse.status === 200) {
            return new Response(indexResponse.body, {
              status: 200,
              headers: indexResponse.headers,
            });
          }
        } catch (error) {
          console.error("SPA fallback error:", error);
        }
      }

      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);

      // Last-resort SPA fallback if the server crashed on a client route
      if (assets && !url.pathname.startsWith("/api/")) {
        try {
          const indexResponse = await serveIndexHtml(assets, request);
          if (indexResponse.status === 200) return indexResponse;
        } catch {
          // ignore
        }
      }

      return brandedErrorResponse();
    }
  },
};
