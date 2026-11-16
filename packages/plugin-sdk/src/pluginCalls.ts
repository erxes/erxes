import type { coreContract } from '@erxes/core-contract';
import type { ContractRouterClient } from '@orpc/contract';
import { z } from 'zod';

type CoreClient = ContractRouterClient<typeof coreContract>;

type CallToken = Awaited<ReturnType<CoreClient['plugins']['callToken']>>;

/**
 * Core refused a token to read another plugin's API. `code`: `READ_NOT_APPROVED` (the manifest's
 * `pluginReads` doesn't name it, or the owner hasn't approved it), `PLUGIN_NOT_INSTALLED` (not in
 * this organisation), `PLUGIN_UNREACHABLE` (it has no API address), `NOT_IN_PLAN`, or another of
 * core's codes.
 */
export class PluginCallError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** A cached call token is replaced this long before it ends (they last 5 minutes). */
const RENEW_BEFORE_MS = 30_000;

/** Core's answer to a refused token request, as the oRPC client throws it. */
const Refusal = z.object({ status: z.number(), code: z.string(), message: z.string() });

const asCallError = (error: unknown) => {
  const refusal = Refusal.safeParse(error);

  return refusal.success
    ? new PluginCallError(refusal.data.status, refusal.data.code, refusal.data.message)
    : error;
};

/**
 * `fetchPlugin(orgId, plugin, path, init)`: the other plugin's API at `<its api.url><path>` with
 * a call token from core, cached per organisation and plugin. A 401 gets one more try with a new
 * token, so send a body that can go twice (text or bytes, not a stream).
 */
export const pluginCalls = (
  clientFor: (orgId: string) => CoreClient,
  fetcher: typeof globalThis.fetch,
) => {
  const tokens = new Map<string, Promise<CallToken>>();

  const tokenFor = async (orgId: string, plugin: string, refused?: string) => {
    const key = `${orgId}/${plugin}`;
    const cached = tokens.get(key);

    if (cached) {
      const value = await cached.catch(() => null);

      if (
        value &&
        value.token !== refused &&
        Date.parse(value.expiresAt) - Date.now() > RENEW_BEFORE_MS
      ) {
        return value;
      }

      // Another call is renewing it already.
      const renewing = tokens.get(key);

      if (renewing && renewing !== cached) return renewing;
    }

    const request = clientFor(orgId)
      .plugins.callToken({ name: plugin })
      .catch((error: unknown) => {
        throw asCallError(error);
      });

    tokens.set(key, request);
    request.catch(() => {
      if (tokens.get(key) === request) tokens.delete(key);
    });

    return request;
  };

  return async (orgId: string, plugin: string, path: string, init: RequestInit = {}) => {
    const send = (call: CallToken) => {
      const headers = new Headers(init.headers);

      headers.set('authorization', `Bearer ${call.token}`);

      return fetcher(`${call.apiUrl.replace(/\/+$/, '')}${path}`, { ...init, headers });
    };

    const call = await tokenFor(orgId, plugin);
    const response = await send(call);

    if (response.status !== 401) return response;

    // The other plugin refused the token (core's signing key replaced): once more with a new one.
    await response.body?.cancel();

    return send(await tokenFor(orgId, plugin, call.token));
  };
};
