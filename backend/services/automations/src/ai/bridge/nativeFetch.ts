// Node's built-in fetch (undici), used by the AI provider bridges.
//
// These bridges previously used `node-fetch@2`, which throws
// `Invalid response body ... Premature close` when reading responses from some
// Cloudflare/HTTP-2-fronted providers (notably the Kimi `coding` endpoint at
// api.kimi.com) — the exact same request succeeds with the native client. The
// installed @types/node (18) doesn't yet declare the global, so we type only
// the small surface the bridges use.
type TNativeFetchInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
};

type TNativeFetchResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  text: () => Promise<string>;
};

export const nativeFetch = (globalThis as { fetch?: unknown }).fetch as (
  url: string,
  init?: TNativeFetchInit,
) => Promise<TNativeFetchResponse>;
