import { withOrg } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import { hashPassword, randomToken } from '~/lib/crypto';
import { keyedOf } from '~/modules/integrations/registry';
import { connectionKeys } from '~/modules/integrations/subscriptionState';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
import { urlOf } from './fakeGateway';
import { useTestServer } from './support';

const SALES = { email: 'sales@initech.mn', password: 'Sales-pass-1' };

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

const Keys = z.object({ accessToken: z.string() });

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const back = (callback: string, cookie = '') =>
  fetch(callback, { redirect: 'manual', headers: cookie ? { cookie } : {} });

const connectedIn = (response: Response) =>
  new URL(response.headers.get('location') ?? '', 'http://x').searchParams.get('connected') ?? '';

const gate = () => {
  let resolve: (() => void) | undefined;

  const opened = new Promise<void>((done) => {
    resolve = done;
  });

  return { open: () => resolve?.(), opened };
};

const lockWaited = async () => {
  for (let tries = 0; tries < 200; tries += 1) {
    const { rows } = await adminDb().execute<{ waiting: number }>(
      sql`select count(*)::int as waiting from pg_stat_activity
          where datname = current_database() and wait_event_type = 'Lock'`,
    );

    if ((rows[0]?.waiting ?? 0) > 0) return;

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error('no statement waited for a row lock');
};

describe('Signing in to an app from Settings', { timeout: 300_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  const member = server.browser();
  const realFetch = globalThis.fetch;
  const tokenForms: URLSearchParams[] = [];
  const liveRefreshTokens = new Set<string>();
  let orgId = '';
  let held = Promise.resolve();

  const google = async (form: URLSearchParams) => {
    tokenForms.push(form);
    await held;

    const refreshToken = randomToken(8);

    liveRefreshTokens.add(refreshToken);

    if (form.get('grant_type') !== 'refresh_token')
      return json({ access_token: 'ya29.first', refresh_token: refreshToken, expires_in: 30 });

    if (!liveRefreshTokens.delete(form.get('refresh_token') ?? ''))
      return json({ error: 'invalid_grant' }, 400);

    return json({ access_token: 'ya29.renewed', refresh_token: refreshToken, expires_in: 3600 });
  };

  const refreshes = () => tokenForms.filter((form) => form.get('grant_type') === 'refresh_token');

  const startSignIn = async (name: string) => {
    const { url } = await member.api.integrations.authorize({ key: 'googlesheets', name });

    return server.url(
      `/core/v1/integrations/oauth/callback?code=code-${name}&state=${new URL(url).searchParams.get('state') ?? ''}`,
    );
  };

  beforeAll(async () => {
    vi.stubGlobal('fetch', async (input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);

      if (url === TOKEN_URL)
        return google(new URLSearchParams(typeof init?.body === 'string' ? init.body : ''));

      if (url.startsWith('https://www.googleapis.com/oauth2/v3/userinfo'))
        return json({ email: SALES.email });

      return realFetch(input, init);
    });

    const { organization } = await createOrganization({
      subdomain: 'initech',
      name: 'Initech',
      owner: {
        email: SALES.email,
        passwordHash: await hashPassword(SALES.password),
        fullName: 'Sales Dorj',
      },
    });

    orgId = organization.id;
    await member.api.auth.signIn(SALES);
    await member.api.integrations.setOAuthApp({
      key: 'googlesheets',
      clientId: 'initech.apps.googleusercontent.com',
      clientSecret: 'initech-secret',
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('saves a sign-in only in the browser that started it', async () => {
    const callback = await startSignIn('Sales');

    const elsewhere = await back(callback);

    expect(elsewhere.status).toBe(403);
    expect(await elsewhere.text()).toBe(
      'This sign-in was started by another erxes account or browser. Start again from Settings.',
    );
    expect((await member.api.integrations.connections({ key: 'googlesheets' })).data).toEqual([]);

    const started = await back(callback, member.cookie());

    expect(started.status).toBe(302);
    expect((await member.api.integrations.connections({ key: 'googlesheets' })).data).toEqual([
      expect.objectContaining({ id: connectedIn(started), name: 'Sales' }),
    ]);
  });

  it('sends a sign-in that comes back to the fixed callback address on to the organisation’s own address to finish', async () => {
    config.integrations.oauthCallbackUrl =
      'https://hooks.erxes.test/core/v1/integrations/oauth/callback';

    try {
      const hop = await back(await startSignIn('Leads'));
      const finish = new URL(hop.headers.get('location') ?? '');

      expect(hop.status).toBe(302);
      expect(finish.pathname).toBe('/core/v1/integrations/oauth/finish');
      expect(finish.searchParams.get('code')).toBe('code-Leads');

      const finished = await back(server.url(finish.pathname + finish.search), member.cookie());

      expect(connectedIn(finished)).not.toBe('');
      expect(tokenForms.at(-1)?.get('redirect_uri')).toBe(config.integrations.oauthCallbackUrl);
    } finally {
      config.integrations.oauthCallbackUrl = undefined;
    }
  });

  it('renews a due sign-in once when two callers need it at the same time', async () => {
    const connectionId = connectedIn(await back(await startSignIn('Ops'), member.cookie()));
    const sheets = keyedOf('googlesheets');
    const keys = () => withOrg(orgId, (tx) => connectionKeys(tx, sheets, connectionId));
    const provider = gate();

    held = provider.opened;

    const before = refreshes().length;
    const first = keys();

    await vi.waitFor(() => expect(refreshes()).toHaveLength(before + 1));

    const second = keys();

    await lockWaited();
    provider.open();

    const both = await Promise.allSettled([first, second]);

    expect(refreshes()).toHaveLength(before + 1);
    expect(
      both.map((result) =>
        result.status === 'fulfilled'
          ? Keys.parse(result.value).accessToken
          : `refused: ${String(result.reason)}`,
      ),
    ).toEqual(['ya29.renewed', 'ya29.renewed']);
  });
});
