import { CORE_API_PREFIX, type coreContract, type PluginManifest } from '@erxes/core-contract';
import { coreRoutes } from '@erxes/core-contract/routes';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { z } from 'zod';

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

/** `POST /plugins/token`'s answer: a token, or an error's code and message. */
const TokenAnswer = z.object({
  access_token: z.string().optional(),
  expires_in: z.number().optional(),
  code: z.string().optional(),
  message: z.string().optional(),
});

export const createCoreClient = (options: CoreClientOptions) => {
  const fetcher = options.fetch ?? globalThis.fetch;
  const base = options.coreUrl.replace(/\/+$/, '');
  const tokens = new Map<string, Promise<CachedToken>>();

  const requestToken = async (org?: string): Promise<CachedToken> => {
    const response = await fetcher(`${base}${CORE_API_PREFIX}/plugins/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: options.plugin,
        client_secret: options.clientSecret,
        org,
      }),
    });

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

  /** A token for the organisation (or the deployment), renewed a minute before it ends. */
  const tokenFor = async (org?: string, fresh = false): Promise<string> => {
    const key = org ?? '';
    const cached = tokens.get(key);

    if (cached && !fresh) {
      const value = await cached.catch(() => null);

      if (value && value.expiresAt - Date.now() > 60_000) return value.token;
    }

    const request = requestToken(org);

    tokens.set(key, request);
    request.catch(() => tokens.delete(key));

    return (await request).token;
  };

  const clientFor = (org?: string): CoreClient =>
    createORPCClient(
      new OpenAPILink(coreRoutes, {
        url: `${base}${CORE_API_PREFIX}`,
        fetch: async (request, init) => {
          const send = async (token: string) => {
            const headers = new Headers(request.headers);

            headers.set('authorization', `Bearer ${token}`);

            return fetcher(new Request(request, { headers }), init);
          };

          const response = await send(await tokenFor(org));

          // Uninstalled and reinstalled, or scopes changed: try once with a new token.
          return response.status === 401 ? send(await tokenFor(org, true)) : response;
        },
      }),
    );

  const orgClients = new Map<string, CoreClient>();

  return {
    /** The core API acting in one organisation (that installed the plugin). */
    forOrg(orgId: string): CoreClient {
      const known = orgClients.get(orgId);

      if (known) return known;

      const client = clientFor(orgId);

      orgClients.set(orgId, client);

      return client;
    },
    /** Declares the plugin's UI, API, scopes, permissions and events. Call at startup. */
    registerManifest: (manifest: PluginManifest) => clientFor().plugins.registerManifest(manifest),
    /** Tells the plugin's open UIs that topics changed (needs `live:write`). */
    signal: (orgId: string, topics: string[], userIds?: string[]) =>
      clientFor(orgId).plugins.signal({ topics, userIds }),
  };
};
