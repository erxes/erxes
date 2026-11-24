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
  let authorizeUrl = new URL('https://www.facebook.com/');

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

    authorizeUrl = new URL(url);

    const state = authorizeUrl.searchParams.get('state') ?? '';

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

  it('signs in to Facebook without PKCE, which Meta’s business apps refuse', () => {
    const exchange = facebook.calls.find((call) => call.url.includes('/oauth/access_token'));
    const form = new URLSearchParams(exchange?.body);

    expect(connectionId).not.toBe('');
    expect(authorizeUrl.searchParams.has('code_challenge')).toBe(false);
    expect(authorizeUrl.searchParams.has('code_challenge_method')).toBe(false);
    expect(form.get('code')).toBe('fb-code');
    expect(form.get('client_secret')).toBe(APP_SECRET);
    expect(form.has('code_verifier')).toBe(false);
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

  it('turns away a token from before the owner’s approval, so the plugin takes a new one at once', async () => {
    await register([]);

    const before = await t.pluginToken(undefined, t.ids.org);

    await register([{ integration: 'facebook', reason: 'Messenger and comments in the inbox' }]);

    const usable = (token: string) =>
      fetch(t.url('/core/v1/integrations/facebook/usable'), {
        headers: { authorization: `Bearer ${token}` },
      });

    expect((await usable(before)).status).toBe(401);
    expect((await usable(await t.pluginToken(undefined, t.ids.org))).status).toBe(200);
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

  it('lists a plugin integration that connects through a core integration with its connection', async () => {
    const inbox = {
      key: 'meta',
      name: 'Facebook and Instagram',
      summary: 'Messenger chats answered in the inbox',
      category: 'social' as const,
      permission: 'hr.inbox.manage',
      connection: 'facebook',
    };

    const manifest = {
      title: 'HR',
      version: '1',
      scopes: [],
      permissions: [{ action: 'hr.inbox.manage', label: 'Manage the inbox' }],
      integrations: [inbox],
    };

    const plugin = t.client(await t.pluginToken()).plugins;

    // It connects only through a core integration the manifest's connections name.
    await expect(plugin.registerManifest({ ...manifest, connections: [] })).rejects.toMatchObject({
      code: 'UNKNOWN_INTEGRATION',
    });

    await plugin.registerManifest({
      ...manifest,
      connections: [{ integration: 'facebook', reason: 'Messenger in the inbox' }],
    });

    const listed = (await t.owner().integrations.list()).data;

    expect(listed.find((row) => row.plugin === 'hr')).toMatchObject({
      key: 'meta',
      connection: 'facebook',
    });
    expect(listed.find((row) => row.key === 'facebook')).toMatchObject({
      plugin: null,
      connection: null,
    });
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
