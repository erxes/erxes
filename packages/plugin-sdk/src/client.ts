import {
  CORE_API_PREFIX,
  type coreContract,
  type IntegrationStatus,
  type PluginManifest,
} from '@erxes/core-contract';
import { coreRoutes } from '@erxes/core-contract/routes';
import { createORPCClient, ORPCError } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { z } from 'zod';
import { pluginCalls } from './pluginCalls';

export type CoreClient = ContractRouterClient<typeof coreContract>;

export interface CoreClientOptions {
  /** Core's address, e.g. `https://acme.erxes.io` (without `/core/v1`). */
  coreUrl: string;
  plugin: string;
  clientSecret: string;
  fetch?: typeof globalThis.fetch;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

export class CoreTokenError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * For `.catch()` on a core call in a plugin procedure:
 * `core.forOrg(orgId).customers.get({ id }).catch(passCoreError('customers'))`.
 * Core's answer to the request (a 4xx: `INVALID_INPUT` with its issues' paths, `NOT_FOUND`,
 * `TAKEN` with its `field`) goes on to the plugin's caller with its status, code and data.
 * Core not answering, a 5xx, or core refusing the plugin's own token throws 503
 * `SERVICE_UNAVAILABLE`, naming `what` could not be reached.
 */
export const passCoreError =
  (what: string) =>
  (error: unknown): never => {
    if (
      error instanceof ORPCError &&
      error.status >= 400 &&
      error.status < 500 &&
      error.status !== 401
    ) {
      throw new ORPCError(error.code, {
        status: error.status,
        message: error.message,
        data: error.data,
        cause: error,
      });
    }

    throw new ORPCError('SERVICE_UNAVAILABLE', {
      status: 503,
      message: `erxes ${what} could not be reached. Try again shortly.`,
      cause: error,
    });
  };

/** `POST /plugins/token`'s answer: a token, or an error's code and message. */
const TokenAnswer = z.object({
  access_token: z.string().optional(),
  expires_in: z.number().optional(),
  code: z.string().optional(),
  message: z.string().optional(),
});

/** A cached token is replaced this long before it ends, so no call carries an expiring one. */
const RENEW_BEFORE_MS = 60_000;

/** The pause before the one retry of a token request that failed on core's side. */
const TOKEN_RETRY_MS = 500;

/** The plugin's core tokens, one per organisation (and one for the deployment), kept fresh. */
const pluginTokens = (
  options: CoreClientOptions,
  fetcher: typeof globalThis.fetch,
  base: string,
) => {
  const tokens = new Map<string, Promise<CachedToken>>();

  const askOnce = (org?: string) =>
    fetcher(`${base}${CORE_API_PREFIX}/plugins/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: options.plugin,
        client_secret: options.clientSecret,
        org,
      }),
    });

  /** Core restarting or a network blip gets one more try; the second failure is the answer. */
  const ask = async (org?: string) => {
    try {
      const response = await askOnce(org);

      if (response.status < 500) return response;

      await response.body?.cancel();
    } catch {
      // The connection failed: the second try below reports it if it fails again.
    }

    await new Promise((resolve) => setTimeout(resolve, TOKEN_RETRY_MS));

    return askOnce(org);
  };

  const requestToken = async (org?: string): Promise<CachedToken> => {
    const response = await ask(org);

    // An answer that isn't this shape carries no token: CoreTokenError below.
    const body = TokenAnswer.safeParse(await response.json().catch(() => null)).data ?? {};

    if (!response.ok || !body.access_token) {
      throw new CoreTokenError(
        response.status,
        body.code ?? 'TOKEN_FAILED',
        body.message ?? 'Could not get a core token',
      );
    }

    return { token: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 900) * 1000 };
  };

  /**
   * The organisation's (or the deployment's) token, renewed a minute before it
   * ends. `refused` is a token core just turned down: it is replaced once, for
   * every call that failed with it at the same time.
   */
  return async (org?: string, refused?: string): Promise<string> => {
    const key = org ?? '';
    const cached = tokens.get(key);

    if (cached) {
      const value = await cached.catch(() => null);

      if (value && value.token !== refused && value.expiresAt - Date.now() > RENEW_BEFORE_MS) {
        return value.token;
      }

      // Another call is renewing it already.
      const renewing = tokens.get(key);

      if (renewing && renewing !== cached) return (await renewing).token;
    }

    const request = requestToken(org);

    tokens.set(key, request);
    request.catch(() => {
      if (tokens.get(key) === request) tokens.delete(key);
    });

    return (await request).token;
  };
};

export const createCoreClient = (options: CoreClientOptions) => {
  const fetcher = options.fetch ?? globalThis.fetch;
  const base = options.coreUrl.replace(/\/+$/, '');
  const tokenFor = pluginTokens(options, fetcher, base);

  const clientFor = (org?: string): CoreClient =>
    createORPCClient(
      new OpenAPILink(coreRoutes, {
        url: `${base}${CORE_API_PREFIX}`,
        fetch: async (request, init) => {
          // Read once: a request's body can be sent only once, and a 401 sends it again.
          const body = request.body ? await request.arrayBuffer() : undefined;

          const send = (token: string) => {
            const headers = new Headers(request.headers);

            headers.set('authorization', `Bearer ${token}`);

            return fetcher(new Request(request, body ? { headers, body } : { headers }), init);
          };

          const token = await tokenFor(org);
          const response = await send(token);

          // Core refused a token it issued (its signing key replaced): once more with a new one.
          return response.status === 401 ? send(await tokenFor(org, token)) : response;
        },
      }),
    );

  const orgClients = new Map<string, CoreClient>();

  /** The core API acting in one organisation (that installed the plugin). */
  const forOrg = (orgId: string): CoreClient => {
    const known = orgClients.get(orgId);

    if (known) return known;

    const client = clientFor(orgId);

    orgClients.set(orgId, client);

    return client;
  };

  return {
    forOrg,
    /**
     * Another plugin's API, read for an organisation: `fetchPlugin(orgId, 'sales', '/v1/deals/x')`
     * requests `<sales api.url>/v1/deals/x` with a 5-minute token core issued for the reads the
     * manifest's `pluginReads` asks and the owner approved, and returns the Response. Throws
     * `PluginCallError` when core refuses the token (`READ_NOT_APPROVED`, `PLUGIN_NOT_INSTALLED`).
     */
    fetchPlugin: pluginCalls(forOrg, fetcher),
    /** Declares the plugin's UI, API, scopes, permissions and events. Call at startup. */
    registerManifest: (manifest: PluginManifest) => clientFor().plugins.registerManifest(manifest),
    /** Tells the plugin's open UIs that topics changed (needs `live:write`). */
    signal: (orgId: string, topics: string[], userIds?: string[]) =>
      clientFor(orgId).plugins.signal({ topics, userIds }),
    /**
     * Says where one of the manifest's `integrations` stands in an organisation, shown on its
     * tile in Settings › Integrations (`count`: how many are connected, when known).
     */
    reportIntegration: (
      orgId: string,
      key: string,
      state: IntegrationStatus['state'],
      count?: number | null,
    ) => clientFor(orgId).integrations.report({ key, state, count }),
  };
};
