import { CORE_API_PREFIX, coreContract } from '@erxes/core-contract';
import { createORPCClient, onError, ORPCError } from '@orpc/client';
import type { ContractRouterClient, InferContractRouterInputs } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { Logger } from 'pino';
import { afterAll, beforeAll } from 'vite-plus/test';
import { newId, users } from '@erxes/core-db';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken } from './db';
import { HR_SECRET } from './plugin';

export type CoreClient = ContractRouterClient<typeof coreContract>;

/** What each procedure takes, e.g. `CoreInputs['customers']['list']`. */
export type CoreInputs = InferContractRouterInputs<typeof coreContract>;

/**
 * Who calls: a bearer token, a member (a token at their current session
 * version on every call, so it outlives password changes), or the `hr` test
 * plugin, which first trades its client secret for a token for `org`.
 */
export type TestCaller = string | { user: string; org: string } | { plugin: string; org?: string };

const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

const SESSION = 'erxes_session=';

/**
 * Serves the app on a free port for this test file. `client(caller)` is the
 * typed contract client plugins and the UI use: a call returns the output or
 * throws an `ORPCError` with `status`, `code` and `data`. `url(path)` and
 * `headers(token)` are for raw HTTP (cookies, CSRF, downloads). `log` replaces
 * the app's logger, to read what it writes.
 */
export const useTestServer = (log?: Logger) => {
  let server: Server | undefined;
  let base = '';

  beforeAll(async () => {
    const listening = createApp(log).listen(0);

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
        // A 4xx the procedure doesn't declare reaches clients untyped: fail the test.
        interceptors: [
          onError((error) => {
            if (error instanceof ORPCError && error.status < 500 && !error.defined)
              throw new Error(`${error.code} (${error.status}) is not in the procedure's errors`, {
                cause: error,
              });
          }),
        ],
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

  /**
   * The UI's view of core: a client that keeps the session cookie core sets
   * and sends it back, from core's own origin, the way a browser does.
   * `cookie()` is that cookie (`erxes_session=…`), or '' before a sign-in.
   * `browser(cookie)` starts from a cookie another browser had.
   */
  const browser = (initial = '') => {
    let cookie = initial;

    const api: CoreClient = createORPCClient(
      new OpenAPILink(coreContract, {
        url: () => `${base}${CORE_API_PREFIX}`,
        headers: () => ({ origin: base, ...(cookie ? { cookie } : {}) }),
        fetch: async (request, init) => {
          const response = await fetch(request, init);
          const session = response.headers.getSetCookie().find((set) => set.startsWith(SESSION));

          if (session !== undefined) cookie = session.split(';')[0] ?? '';

          return response;
        },
      }),
    );

    return { api, cookie: () => cookie };
  };

  return {
    url: (path: string) => `${base}${path}`,
    headers: bearer,
    client,
    browser,
    pluginToken,
  };
};

/**
 * Two organisations on a test server: Acme with its owner, an active member and
 * a disabled one, and Globex with its owner. `owner()`, `member()` and `other()`
 * are those members' clients, `hr(org)` the test plugin's for Acme or `org`.
 */
export const useTwoOrgs = () => {
  const server = useTestServer();
  const ids = { org: '', otherOrg: '', owner: '', member: '', disabled: '', otherOwner: '' };

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn' },
    });

    const globex = await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: 'owner@globex.mn' },
    });

    Object.assign(ids, {
      org: acme.organization.id,
      otherOrg: globex.organization.id,
      owner: acme.owner.id,
      member: newId(),
      disabled: newId(),
      otherOwner: globex.owner.id,
    });

    await adminDb()
      .insert(users)
      .values([
        {
          id: ids.member,
          orgId: ids.org,
          email: 'member@acme.mn',
          role: 'member',
          status: 'active',
        },
        {
          id: ids.disabled,
          orgId: ids.org,
          email: 'gone@acme.mn',
          role: 'member',
          status: 'disabled',
        },
      ]);
  });

  return {
    ...server,
    ids,
    owner: () => server.client({ user: ids.owner, org: ids.org }),
    member: () => server.client({ user: ids.member, org: ids.org }),
    other: () => server.client({ user: ids.otherOwner, org: ids.otherOrg }),
    hr: (org = ids.org) => server.client({ plugin: HR_SECRET, org }),
    /** A member's bearer token at their current session version, for raw requests. */
    token: (user = ids.owner, org = ids.org) => currentToken(user, org),
  };
};
