import { CORE_API_PREFIX, coreContract } from '@erxes/core-contract';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { afterAll, beforeAll } from 'vite-plus/test';
import { createApp } from '~/app';
import { currentToken } from './db';
import { HR_SECRET } from './plugin';

export type CoreClient = ContractRouterClient<typeof coreContract>;

/**
 * Who calls: a bearer token, a member (a token at their current session
 * version on every call, so it outlives password changes), or the `hr` test
 * plugin, which first trades its client secret for a token for `org`.
 */
export type TestCaller = string | { user: string; org: string } | { plugin: string; org?: string };

const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

/**
 * Serves the app on a free port for this test file. `client(caller)` is the
 * typed contract client plugins and the UI use: a call returns the output or
 * throws an `ORPCError` with `status`, `code` and `data`. `url(path)` and
 * `headers(token)` are for raw HTTP (cookies, CSRF, downloads).
 */
export const useTestServer = () => {
  let server: Server | undefined;
  let base = '';

  beforeAll(async () => {
    const listening = createApp().listen(0);

    await once(listening, 'listening');

    const address = listening.address();

    if (address === null || typeof address === 'string')
      throw new Error('The test server has no TCP port');

    server = listening;
    base = `http://127.0.0.1:${address.port}`;
  });

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        if (!server) {
          resolve();

          return;
        }

        server.close(() => resolve());
        // Open streams (/core/v1/stream) would keep close() waiting.
        server.closeAllConnections();
      }),
  );

  const client = (caller?: TestCaller): CoreClient =>
    createORPCClient(
      new OpenAPILink(coreContract, {
        url: () => `${base}${CORE_API_PREFIX}`,
        headers: async () => {
          if (caller === undefined) return {};

          if (typeof caller === 'string') return bearer(caller);

          if ('user' in caller) return bearer(await currentToken(caller.user, caller.org));

          return bearer(await pluginToken(caller.plugin, caller.org));
        },
      }),
    );

  /** A plugin token for `org` (or the manifest-only one); throws the token endpoint's error. */
  const pluginToken = async (secret = HR_SECRET, org?: string) => {
    const token = await client().plugins.token({
      grant_type: 'client_credentials',
      client_id: 'hr',
      client_secret: secret,
      org,
    });

    return token.access_token;
  };

  return {
    url: (path: string) => `${base}${path}`,
    headers: bearer,
    client,
    pluginToken,
  };
};
