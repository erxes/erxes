import { CORE_API_PREFIX, coreContract } from '@erxes/core-contract';
import { closeDb, configureDb, runMigrations } from '@erxes/core-db';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { Client } from 'pg';
import { afterAll, beforeAll } from 'vite-plus/test';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { SESSION_COOKIE } from '~/http/cookies';
import { sessionVersionOf } from '~/modules/auth/account.service';
import { syncPluginSecrets } from '~/modules/plugins/plugins.service';

const baseUrl = process.env.DATA_TEST_URL;

// The API tests run against a real Postgres and never skip.
if (!baseUrl) {
  throw new Error(
    [
      'DATA_TEST_URL is not set. The core-api tests need a Postgres where they may create and drop databases.',
      'Local: docker compose up -d, then',
      '  DATA_TEST_URL=postgres://erxes:erxes_local_dev@127.0.0.1:5434/erxes pnpm test',
    ].join('\n'),
  );
}

const testDbName = new URL(baseUrl).pathname.slice(1) || 'erxes';

/** Runs one statement on DATA_TEST_URL's database: CREATE or DROP DATABASE. */
export const admin = async (statement: string) => {
  const client = new Client({ connectionString: baseUrl });

  await client.connect();

  try {
    await client.query(statement);
  } finally {
    await client.end();
  }
};

/**
 * A throwaway database for this test file, migrated from packages/db/drizzle.
 * Named after DATA_TEST_URL's database (`erxes_core_test_1a2b3c4d`), so it is clear whose it is.
 * `url()` is its address once the suite started.
 */
export const useTestDatabase = () => {
  const name = `${testDbName}_${randomBytes(4).toString('hex')}`;
  let address = '';

  beforeAll(async () => {
    await admin(`CREATE DATABASE "${name}"`);

    const url = new URL(baseUrl);
    url.pathname = `/${name}`;
    address = url.toString();

    configureDb({ url: address, applicationName: 'erxes-core-test' });
    await runMigrations();
    // Registers the test plugin `hr` (CORE_PLUGIN_KEYS in vite.config.ts).
    await syncPluginSecrets();
  });

  afterAll(async () => {
    await closeDb();
    await admin(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  });

  return { url: () => address };
};

/** The session token a response set in its cookie ('' if none), for raw requests or `client()`. */
export const sessionToken = (response: Response) => {
  const prefix = `${SESSION_COOKIE}=`;
  const cookie = response.headers.getSetCookie().find((value) => value.startsWith(prefix)) ?? '';

  return cookie.slice(prefix.length).split(';')[0] ?? '';
};

/** The test plugin's client secret (CORE_PLUGIN_KEYS in vite.config.ts). */
export const HR_SECRET = 'test-hr-plugin-key-0123456789abcdefghijklmnop';

/**
 * A member's access token at their current session version, as a sign-in now
 * would issue it. A password change or disable ends the tokens issued before.
 */
export const accessToken = async (userId: string, orgId: string) =>
  signAccessToken(userId, orgId, undefined, await sessionVersionOf(orgId, userId));

/**
 * Who calls: a bearer token, a member (`accessToken` on every call, so it
 * outlives session changes), or the `hr` plugin with a client secret, which
 * first trades it for a token for `org` (`POST /plugins/token`). Without
 * `org` that is the plugin's manifest-only token.
 */
export type Caller = string | { user: string; org: string } | { plugin: string; org?: string };

const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

/**
 * Serves the app on a free port for this test file. `client(caller)` is the
 * typed contract client plugins and the UI use: calls return the output or
 * throw an `ORPCError` with `status`, `code` and `data`. `url(path)` and
 * `headers(token)` are for raw HTTP (cookies, CSRF, downloads).
 */
export const useTestServer = () => {
  let server: Server | undefined;
  let base = '';
  let lastStatus = 0;

  beforeAll(async () => {
    const listening = createApp().listen(0);

    await once(listening, 'listening');

    const address = listening.address();

    if (address === null || typeof address === 'string') {
      throw new Error('The test server has no TCP port');
    }

    server = listening;
    base = `http://127.0.0.1:${address.port}`;
  });

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        if (!server) return resolve();

        server.close(() => resolve());
        // Open streams (/core/v1/stream) would keep close() waiting.
        server.closeAllConnections();
      }),
  );

  const client = (caller?: Caller): ContractRouterClient<typeof coreContract> =>
    createORPCClient(
      new OpenAPILink(coreContract, {
        url: () => `${base}${CORE_API_PREFIX}`,
        headers: async () => {
          if (caller === undefined) return {};

          if (typeof caller === 'string') return bearer(caller);

          if ('user' in caller) return bearer(await accessToken(caller.user, caller.org));

          return bearer(await pluginToken(caller.plugin, caller.org));
        },
        fetch: async (request, init) => {
          const response = await fetch(request, init);

          lastStatus = response.status;

          return response;
        },
      }),
    );

  /** A plugin token for `org` (or the manifest-only one); throws the token endpoint's error. */
  const pluginToken = async (secret: string, org?: string) => {
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
    /** The HTTP status of the last response a `client()` call got: 201 on create, 200 on delete. */
    status: () => lastStatus,
    client,
    pluginToken,
  };
};
