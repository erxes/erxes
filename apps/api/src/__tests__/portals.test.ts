import { verifyPortalToken } from '@erxes/plugin-sdk';
import { describe, expect, it } from 'vite-plus/test';
import { lastCode, useCustomers } from './customerAuth.fixture';
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

    // No plugin on it yet: it signs nobody in.
    const browser = t.app({ origin: 'https://tours.example.mn' });

    await expect(browser.api.customerAuth.methods({ portal: portal.id })).rejects.toMatchObject({
      status: 400,
      code: 'UNKNOWN_PORTAL',
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
    expect(await browser.api.customerAuth.methods({ portal: portal.id })).toEqual({
      name: 'Nomad Tours',
      email: true,
      phone: 'code',
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
      browser.api.customerAuth.sendCode({ portal: portal.id, kind: 'email', value: 'a@x.mn' }),
    ).rejects.toMatchObject({ status: 400, code: 'SIGN_IN_UNAVAILABLE' });
  });

  it("gives the portal's server a key it trades for tokens the plugins check", async () => {
    const made = await t.owner().portals.createKey({ id: t.sites.acme, name: 'Shop server' });

    expect(made.secret).toMatch(/^erxp_/);
    expect(made.hint).toBe(made.secret.slice(-4));
    expect((await t.owner().portals.keys({ id: t.sites.acme })).data).toEqual([
      expect.objectContaining({ id: made.id, name: 'Shop server', lastUsedAt: null }),
    ]);

    const server = t.app({ origin: null }).api;
    const token = await server.portalAuth.token({ key: made.secret });

    expect(token).toMatchObject({ portalId: t.sites.acme, expiresIn: 900 });
    expect(await verifyPortalToken(token.accessToken, { coreUrl: t.url('') })).toEqual({
      orgId: t.ids.org,
      portalId: t.sites.acme,
      keyId: made.id,
    });

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

  it('deletes a portal with its accounts; the customer stays', async () => {
    const origin = 'https://popup.example.mn';
    const portal = await t.owner().portals.create({ name: 'Pop-up', origins: [origin] });

    await t.hr().portals.attach({ id: portal.id, recordId: 'popup-1' });

    const { api } = t.app({ origin });
    const address = { portal: portal.id, kind: 'email' as const, value: 'popup@example.com' };

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
