import { verifyPortalRequest, verifyPortalToken } from '@erxes/plugin-sdk';
import { describe, expect, it } from 'vite-plus/test';
import { lastCode, siteOrigin, useCustomers } from './customerAuth.fixture';
import { useTestDatabase } from './db';

describe('portals (decision 42)', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useCustomers();

  it('lets members add a portal that plugins put their records on, and sign customers in once there', async () => {
    const portal = await t.owner().portals.create({
      name: 'Nomad Tours',
      origins: ['https://tours.example.mn'],
      iosBundleIds: ['mn.nomad.tours'],
    });

    expect(portal).toMatchObject({ emailSignIn: true, phoneSignIn: true, senderName: null });

    // No plugin on it yet: its key trades for no token, so it signs nobody in.
    const origin = 'https://tours.example.mn';

    const { secret: key } = await t
      .owner()
      .portals.createKey({ id: portal.id, name: 'Tours app', kind: 'publishable' });

    await expect(t.tradeKey(key, origin)).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_TOKEN',
    });

    expect(await t.hr().portals.attach({ id: portal.id, recordId: 'tours-1' })).toMatchObject({
      portalId: portal.id,
      plugin: 'hr',
      recordId: 'tours-1',
    });

    expect(await t.owner().portals.get({ id: portal.id })).toMatchObject({
      plugins: ['hr'],
      accounts: 0,
    });
    const browser = t.app({ origin, portalToken: await t.tradeKey(key, origin) });

    expect(await browser.api.customerAuth.methods()).toEqual({
      name: 'Nomad Tours',
      email: true,
      phone: 'code',
      phoneMethods: ['code'],
      googleClientId: null,
      appleServicesId: null,
      facebookAppId: null,
    });

    // The plugin's record moves: off the portal it was on.
    await t.hr().portals.attach({ id: t.sites.outlet, recordId: 'tours-1' });

    expect((await t.owner().portals.get({ id: portal.id })).plugins).toEqual([]);

    await t.hr().portals.attach({ id: portal.id, recordId: 'tours-1' });

    // Members set it up; plugins and other members don't.
    await expect(t.member().portals.update({ id: portal.id, name: 'Mine' })).rejects.toMatchObject({
      status: 403,
    });
    await expect(t.other().portals.get({ id: portal.id })).rejects.toMatchObject({ status: 404 });
    await expect(
      t.owner().portals.update({ id: portal.id, googleConnectionId: 'nope' }),
    ).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_CONNECTION' });

    await t.owner().portals.update({ id: portal.id, emailSignIn: false, senderName: 'Nomad' });

    await expect(
      browser.api.customerAuth.sendCode({ kind: 'email', value: 'a@x.mn' }),
    ).rejects.toMatchObject({ status: 400, code: 'SIGN_IN_UNAVAILABLE' });
  });

  it('makes one portal for a record its plugin saves twice at once', async () => {
    const save = () =>
      t.hr().portals.save({ recordId: 'site-twice', name: 'Twice Site', origins: [] });

    const [first, second] = await Promise.all([save(), save()]);

    expect(second.id).toBe(first.id);
    expect(
      (await t.owner().portals.list()).data.filter((portal) => portal.name === 'Twice Site'),
    ).toHaveLength(1);
  });

  it("gives the portal's server a portal key it trades for tokens the plugins check", async () => {
    const made = await t.owner().portals.createKey({ id: t.sites.acme, name: 'Shop server' });

    expect(made.secret).toMatch(/^erxp_/);
    expect(made.hint).toBe(made.secret.slice(-4));
    expect((await t.owner().portals.keys({})).data[0]).toEqual(
      expect.objectContaining({
        id: made.id,
        name: 'Shop server',
        portalName: 'acme shop',
        lastUsedAt: null,
      }),
    );
    // Globex sees its own keys only: its app's.
    expect((await t.other().portals.keys({})).data.map((key) => key.portalId)).toEqual([
      t.sites.globex,
    ]);

    const server = t.app({ origin: null }).api;
    const token = await server.portalAuth.token({ key: made.secret });

    expect(token).toMatchObject({ portalId: t.sites.acme, expiresIn: 900 });
    expect(await verifyPortalToken(token.accessToken, { coreUrl: t.url('') })).toEqual({
      orgId: t.ids.org,
      portalId: t.sites.acme,
      keyId: made.id,
      kind: 'secret',
      origin: null,
    });

    // A secret key never works from a browser, even the portal's own pages.
    await expect(
      t.app({ origin: siteOrigin('acme') }).api.portalAuth.token({ key: made.secret }),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    await expect(server.portalAuth.token({ key: `${made.secret}x` })).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_TOKEN',
    });

    // Only its organisation's members revoke it.
    await expect(
      t.other().portals.removeKey({ id: t.sites.acme, keyId: made.id }),
    ).rejects.toMatchObject({ status: 404 });

    await t.owner().portals.removeKey({ id: t.sites.acme, keyId: made.id });

    await expect(server.portalAuth.token({ key: made.secret })).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_TOKEN',
    });
  });

  it("gives the portal's apps a publishable key that browsers trade only from its web addresses", async () => {
    const made = await t
      .owner()
      .portals.createKey({ id: t.sites.acme, name: 'Shop app', kind: 'publishable' });

    expect(made).toMatchObject({ kind: 'publishable', key: made.secret });
    expect(made.secret).toMatch(/^erxpk_/);
    // It stays readable: apps ship it to everyone.
    expect((await t.owner().portals.keys({})).data[0]).toEqual(
      expect.objectContaining({ id: made.id, kind: 'publishable', key: made.secret }),
    );

    const browser = t.app({ origin: siteOrigin('acme') }).api;
    const token = await browser.portalAuth.token({ key: made.secret });

    expect(await verifyPortalToken(token.accessToken, { coreUrl: t.url('') })).toEqual({
      orgId: t.ids.org,
      portalId: t.sites.acme,
      keyId: made.id,
      kind: 'publishable',
      origin: siteOrigin('acme'),
    });

    // Another portal's pages, or anyone else's, can't trade it.
    for (const site of ['outlet', 'globex'] as const) {
      await expect(
        t.app({ origin: siteOrigin(site) }).api.portalAuth.token({ key: made.secret }),
      ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });
    }

    // A mobile app (no Origin) trades it too.
    const app = await t.app({ origin: null }).api.portalAuth.token({ key: made.secret });

    expect(await verifyPortalToken(app.accessToken, { coreUrl: t.url('') })).toMatchObject({
      kind: 'publishable',
      origin: null,
    });

    // Plugins' portal API: the browser's address must be the one the token was made for, and a
    // signed-in customer must be on the same portal. Each visitor is limited on their own.
    const options = { coreUrl: t.url('') };
    const customer = await t.signedIn('pub@x.mn');
    const elsewhere = await t.signedIn('pub@x.mn', 'globex');

    expect(
      await verifyPortalRequest(
        {
          portalToken: token.accessToken,
          authorization: `Bearer ${customer.accessToken}`,
          origin: siteOrigin('acme'),
          ip: '203.0.113.9',
        },
        options,
      ),
    ).toMatchObject({
      orgId: t.ids.org,
      portalId: t.sites.acme,
      customer: { portalId: t.sites.acme },
      visitor: 'ip:203.0.113.9',
    });
    await expect(
      verifyPortalRequest(
        { portalToken: token.accessToken, origin: 'https://evil.example.com' },
        options,
      ),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });
    await expect(
      verifyPortalRequest(
        { portalToken: app.accessToken, authorization: `Bearer ${elsewhere.accessToken}` },
        options,
      ),
    ).rejects.toMatchObject({ status: 401 });
    await expect(
      verifyPortalRequest({ authorization: `Bearer ${customer.accessToken}` }, options),
    ).rejects.toMatchObject({ status: 401 });

    // A secret key's server names its visitor, or is limited as one.
    const server = await t.owner().portals.createKey({ id: t.sites.acme, name: 'Server' });
    const serverToken = await t.app({ origin: null }).api.portalAuth.token({ key: server.secret });

    expect(
      await verifyPortalRequest(
        { portalToken: serverToken.accessToken, ip: '10.0.0.1', visitorIp: '198.51.100.7' },
        options,
      ),
    ).toMatchObject({ visitor: 'ip:198.51.100.7', customer: null });
    expect(
      await verifyPortalRequest({ portalToken: serverToken.accessToken, ip: '10.0.0.1' }, options),
    ).toMatchObject({ visitor: `portal:${t.sites.acme}` });
    await expect(
      verifyPortalRequest(
        { portalToken: serverToken.accessToken, origin: siteOrigin('acme') },
        options,
      ),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    // A publishable key's id with the secret prefix is not a key.
    await expect(
      t.app({ origin: null }).api.portalAuth.token({ key: made.secret.replace('erxpk_', 'erxp_') }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });
  });

  it('deletes a portal with its accounts; the customer stays', async () => {
    const origin = 'https://popup.example.mn';
    const portal = await t.owner().portals.create({ name: 'Pop-up', origins: [origin] });

    await t.hr().portals.attach({ id: portal.id, recordId: 'popup-1' });

    const { secret: key } = await t
      .owner()
      .portals.createKey({ id: portal.id, name: 'Pop-up app', kind: 'publishable' });

    const { api } = t.app({ origin, portalToken: await t.tradeKey(key, origin) });
    const address = { kind: 'email' as const, value: 'popup@example.com' };

    await api.customerAuth.signUp({ ...address, firstName: 'Pop' });

    const { customer } = await api.customerAuth.confirmSignUp({
      ...address,
      code: await lastCode(address.value),
    });

    expect((await t.owner().portals.get({ id: portal.id })).accounts).toBe(1);

    await t.owner().portals.remove({ id: portal.id });

    await expect(t.owner().portals.get({ id: portal.id })).rejects.toMatchObject({ status: 404 });
    expect((await t.owner().customerAccounts.list({ customerId: customer.id })).data).toEqual([]);
    expect(await t.owner().customers.get({ id: customer.id })).toMatchObject({
      primaryEmail: 'popup@example.com',
    });
  });
});
