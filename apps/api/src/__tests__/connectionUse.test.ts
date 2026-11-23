import { events } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { SESSION_COOKIE } from '~/http/cookies';
import { adminDb, useTestDatabase } from './db';
import { APP_ID, APP_SECRET, GRAPH } from './facebook.fixture';
import { fakeGateway, urlOf } from './fakeGateway';
import { useTwoOrgs } from './support';

describe('plugins use the organisation’s connections (decision 52)', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const facebook = fakeGateway([
    [`POST ${GRAPH}/oauth/access_token`, { access_token: 'user-token', expires_in: 5_184_000 }],
    [`GET ${GRAPH}/me?fields=name`, { name: 'Dana Bat' }],
  ]);

  const register = async (connections: { integration: string; reason: string }[]) =>
    t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      scopes: [],
      connections,
    });

  let connectionId = '';

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
      urlOf(input).startsWith('https://graph.facebook.com/')
        ? facebook.fetch(input, init)
        : realFetch(input, init),
    );

    await t.owner().integrations.setOAuthApp({
      key: 'facebook',
      clientId: APP_ID,
      clientSecret: APP_SECRET,
    });

    const { url } = await t.owner().integrations.authorize({ key: 'facebook', name: 'Shop' });
    const state = new URL(url).searchParams.get('state') ?? '';

    const back = await fetch(
      t.url(`/core/v1/integrations/oauth/callback?code=fb-code&state=${state}`),
      { redirect: 'manual', headers: { cookie: `${SESSION_COOKIE}=${await t.token()}` } },
    );

    if (back.status !== 302) throw new Error(`Facebook sign-in answered ${back.status}`);

    const [connection] = (await t.owner().integrations.connections({ key: 'facebook' })).data;

    connectionId = connection?.id ?? '';
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('refuses a plugin whose manifest doesn’t name the integration', async () => {
    await register([]);

    await expect(t.hr().integrations.usable({ key: 'facebook' })).rejects.toMatchObject({
      status: 403,
      code: 'SCOPE_REQUIRED',
    });
    await expect(t.hr().integrations.credentials({ id: connectionId })).rejects.toMatchObject({
      status: 403,
      code: 'SCOPE_REQUIRED',
    });
    // Only core's integrations that sign in with OAuth can be used.
    await expect(register([{ integration: 'qpay', reason: 'Payments' }])).rejects.toMatchObject({
      code: 'UNKNOWN_INTEGRATION',
    });
  });

  it('lists the connections and gives a fresh token and the app once the owner approved it', async () => {
    await register([{ integration: 'facebook', reason: 'Messenger and comments in the inbox' }]);

    const plugin = (await t.owner().plugins.list()).data.find((row) => row.name === 'hr');

    expect(plugin?.requestedScopes).toContain('uses:facebook');

    expect((await t.hr().integrations.usable({ key: 'facebook' })).data).toEqual([
      expect.objectContaining({
        id: connectionId,
        key: 'facebook',
        name: 'Shop',
        status: 'active',
      }),
    ]);

    expect(await t.hr().integrations.credentials({ id: connectionId })).toMatchObject({
      connectionId,
      key: 'facebook',
      accessToken: 'user-token',
      account: 'Dana Bat',
      appId: APP_ID,
      appSecret: APP_SECRET,
    });

    const audit = await t.owner().audit.list({ action: 'integration_connection.credentials_read' });

    expect(audit.data[0]).toMatchObject({ actorType: 'plugin', actorId: 'hr' });

    // The other organisation's plugin never reaches Acme's connection.
    await expect(
      t.hr(t.ids.otherOrg).integrations.credentials({ id: connectionId }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('tells plugins when a connection changes', async () => {
    await t.owner().integrations.update({ key: 'facebook', id: connectionId, status: 'disabled' });

    const published = await adminDb()
      .select({ payload: events.payload })
      .from(events)
      .where(eq(events.type, 'core.integration.changed'));

    expect(published.map((row) => row.payload)).toEqual(
      expect.arrayContaining([
        { key: 'facebook', connectionId, change: 'connected' },
        { key: 'facebook', connectionId, change: 'disabled' },
      ]),
    );

    expect((await t.hr().integrations.usable({ key: 'facebook' })).data).toEqual([]);
  });
});
