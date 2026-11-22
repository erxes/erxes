import { events } from '@erxes/core-db';
import { verifyCustomerToken } from '@erxes/plugin-sdk';
import { inArray } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { aMinuteLater, lastCode, siteOrigin, useCustomers } from './customerAuth.fixture';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';

describe('customer sign-in (decision 42)', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useCustomers();

  it("signs a new customer up to a website with an email code, in the website's own form", async () => {
    const { api } = t.app();

    expect(
      await api.customerAuth.sendCode({
        website: t.sites.acme,
        kind: 'email',
        value: 'Shopper@Example.com',
      }),
    ).toEqual({ expiresInSeconds: 600 });

    const signedIn = await api.customerAuth.signIn({
      website: t.sites.acme,
      kind: 'email',
      value: 'shopper@example.com',
      code: await lastCode('shopper@example.com'),
    });

    expect(signedIn).toMatchObject({
      created: true,
      expiresIn: 900,
      customer: { primaryEmail: 'shopper@example.com' },
    });

    // Plugins check the token with core's public keys; it names the website.
    const jwks = createRemoteJWKSet(new URL(t.url('/core/v1/.well-known/jwks.json')));

    const { payload } = await jwtVerify(signedIn.accessToken, jwks, {
      issuer: 'erxes-core',
      audience: 'erxes-customer',
      typ: 'customer+jwt',
    });

    expect(payload).toMatchObject({ sub: signedIn.customer.id, wid: t.sites.acme });
    expect(
      await verifyCustomerToken(`Bearer ${signedIn.accessToken}`, { coreUrl: t.url('') }),
    ).toEqual({ orgId: t.ids.org, customerId: signedIn.customer.id, websiteId: t.sites.acme });
    // A plugin's own token is not a customer's.
    await expect(
      verifyCustomerToken(`Bearer ${await t.pluginToken(undefined, t.ids.org)}`, {
        coreUrl: t.url(''),
      }),
    ).rejects.toThrow(/typ/);

    const me = t.app({ token: signedIn.accessToken }).api;

    expect(await me.customerAccount.me({})).toMatchObject({
      id: signedIn.customer.id,
      primaryEmail: 'shopper@example.com',
    });

    // A customer token opens nothing else, and no other token opens /customer/*.
    await expect(t.client(signedIn.accessToken).customers.list({})).rejects.toMatchObject({
      status: 401,
    });
    await expect(t.owner().customerAccount.me({})).rejects.toMatchObject({ status: 401 });
    await expect(t.hr().customerAccount.me({})).rejects.toMatchObject({ status: 401 });

    // The team sees who signed up, and on which website.
    await settle();

    const published = await adminDb()
      .select({ type: events.type, subjectId: events.subjectId, payload: events.payload })
      .from(events)
      .where(inArray(events.type, ['core.customer.signed_up', 'core.customer.signed_in']));

    expect(published).toEqual(
      expect.arrayContaining([
        {
          type: 'core.customer.signed_up',
          subjectId: signedIn.customer.id,
          payload: { kind: 'email', websiteId: t.sites.acme },
        },
        {
          type: 'core.customer.signed_in',
          subjectId: signedIn.customer.id,
          payload: { kind: 'email', websiteId: t.sites.acme },
        },
      ]),
    );
  });

  it('keeps one customer with an account per website, each signed up on its own', async () => {
    const known = await t.owner().customers.create({
      firstName: 'Saraa',
      primaryEmail: 'saraa@example.com',
    });

    // The first sign-in gives the login to the customer who already has the address.
    const shop = await t.signedIn('saraa@example.com');

    expect(shop).toMatchObject({ created: false, customer: { id: known.id, firstName: 'Saraa' } });

    // The outlet is another website: the same customer, a new account and session.
    const outlet = await t.signedIn('saraa@example.com', 'outlet');

    expect(outlet.customer.id).toBe(known.id);

    // Each website's token works on that website only.
    await expect(
      t.app({ site: 'outlet', token: shop.accessToken }).api.customerAccount.me({}),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    expect(await shop.me.customerAccount.sessions({}).then((list) => list.data)).toHaveLength(1);

    const accounts = await t.owner().customerAccounts.list({ customerId: known.id });

    expect(accounts.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          websiteId: t.sites.acme,
          websiteName: 'acme shop',
          plugin: 'hr',
          status: 'active',
          logins: ['saraa@example.com'],
          sessions: 1,
        }),
        expect.objectContaining({ websiteId: t.sites.outlet, sessions: 1 }),
      ]),
    );
    expect(accounts.data).toHaveLength(2);
  });

  it('lets staff block an account on one website and sign it out', async () => {
    const shop = await t.signedIn('blocked@example.com');
    const outlet = await t.signedIn('blocked@example.com', 'outlet');

    const accounts = await t.owner().customerAccounts.list({ customerId: shop.customer.id });
    const onShop = accounts.data.find((account) => account.websiteId === t.sites.acme);

    if (!onShop) throw new Error('no account on the shop');

    // Viewing accounts is contacts.view; blocking is contacts.edit, in the member's organisation.
    await expect(
      t.other().customerAccounts.setStatus({ id: onShop.id, status: 'blocked' }),
    ).rejects.toMatchObject({ status: 404 });
    expect(
      await t.owner().customerAccounts.setStatus({ id: onShop.id, status: 'blocked' }),
    ).toMatchObject({ status: 'blocked', sessions: 0 });

    // Signed out at once, and kept out; the outlet still works.
    await expect(shop.me.customerAccount.me({})).rejects.toMatchObject({ status: 401 });
    await expect(
      t.app().api.customerAuth.refresh({ refreshToken: shop.refreshToken }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });
    await aMinuteLater();
    await expect(t.app().signIn('blocked@example.com')).rejects.toMatchObject({
      status: 403,
      code: 'ACCOUNT_BLOCKED',
    });
    expect(await outlet.me.customerAccount.me({})).toMatchObject({ id: shop.customer.id });

    await t.owner().customerAccounts.setStatus({ id: onShop.id, status: 'active' });
    await t.owner().customerAccounts.signOut({ id: onShop.id });

    const after = await t.owner().customerAccounts.list({ customerId: shop.customer.id });

    expect(after.data.find((account) => account.id === onShop.id)).toMatchObject({
      status: 'active',
      sessions: 0,
    });
  });

  it('counts wrong codes: five, then even the right one fails', async () => {
    const { api } = t.app();
    const address = { website: t.sites.acme, kind: 'email', value: 'guess@example.com' } as const;

    await api.customerAuth.sendCode(address);

    const right = await lastCode('guess@example.com');
    const wrong = right === '000000' ? '111111' : '000000';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(api.customerAuth.signIn({ ...address, code: wrong })).rejects.toMatchObject({
        status: 400,
        code: 'INVALID_CODE',
      });
    }

    await expect(api.customerAuth.signIn({ ...address, code: right })).rejects.toMatchObject({
      code: 'INVALID_CODE',
    });
  });

  it("takes a website's code on that website only", async () => {
    await t.app().api.customerAuth.sendCode({
      website: t.sites.acme,
      kind: 'email',
      value: 'elsewhere@example.com',
    });

    await expect(
      t.app({ site: 'outlet' }).api.customerAuth.signIn({
        website: t.sites.outlet,
        kind: 'email',
        value: 'elsewhere@example.com',
        code: await lastCode('elsewhere@example.com'),
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_CODE' });
  });

  it('limits codes per address and requests per network address', async () => {
    const address = { website: t.sites.acme, kind: 'phone', value: '+97699112233' } as const;
    const { api } = t.app();

    await api.customerAuth.sendCode(address);
    // Right after: wait first. Unknown and known addresses answer alike.
    await expect(api.customerAuth.sendCode(address)).rejects.toMatchObject({
      status: 429,
      code: 'TOO_MANY_CODES',
    });

    const flood = t.app();
    const answers = [];

    for (let index = 0; index < 11; index += 1) {
      answers.push(
        await flood.api.customerAuth
          .sendCode({ website: t.sites.acme, kind: 'email', value: `flood${index}@example.com` })
          .then(
            () => 'sent',
            (error: unknown) => z.object({ code: z.string() }).parse(error).code,
          ),
      );
    }

    expect(answers.at(-1)).toBe('TOO_MANY_REQUESTS');
  });

  it("answers browsers only from the website's origins", async () => {
    const preflight = (origin: string) =>
      fetch(t.url('/core/v1/customer-auth/code'), {
        method: 'OPTIONS',
        headers: {
          origin,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type',
        },
      });

    const allowed = await preflight(siteOrigin());

    expect(allowed.status).toBe(204);
    expect(allowed.headers.get('access-control-allow-origin')).toBe(siteOrigin());
    expect(allowed.headers.get('access-control-allow-credentials')).toBeNull();
    expect((await preflight('https://evil.example.com')).status).toBe(403);

    const send = { website: t.sites.acme, kind: 'email', value: 'origin@example.com' } as const;

    await expect(
      t.app({ origin: 'https://evil.example.com' }).api.customerAuth.sendCode(send),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });
    // Another website's page can't sign in to this one.
    await expect(
      t.app({ origin: siteOrigin('globex') }).api.customerAuth.sendCode(send),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    // The website names its organisation.
    const globex = await t.signedIn('origin@example.com', 'globex');
    const acme = await t.signedIn('origin@example.com', 'acme');

    expect(globex.customer.id).not.toBe(acme.customer.id);

    // Acme's token from Globex's shop: refused.
    await expect(
      t.app({ site: 'globex', token: acme.accessToken }).api.customerAccount.me({}),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    // A mobile app or the website's server sends no origin.
    const mobile = t.app({ origin: null }).api;

    await mobile.customerAuth.sendCode({ ...send, value: 'mobile@example.com' });

    expect(
      await mobile.customerAuth.signIn({
        website: t.sites.acme,
        kind: 'email',
        value: 'mobile@example.com',
        code: await lastCode('mobile@example.com'),
      }),
    ).toMatchObject({ created: true });
  });

  it("follows the plugin's websites: changed addresses, removed websites, uninstalls", async () => {
    await expect(
      t.app().api.customerAuth.sendCode({ website: 'nope', kind: 'email', value: 'a@example.com' }),
    ).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_WEBSITE' });

    // A plugin keeps its own websites; members only read them.
    const listed = await t.owner().websites.list({});

    expect(listed.data.map((website) => website.id)).toEqual(
      expect.arrayContaining([t.sites.acme, t.sites.outlet]),
    );
    expect(listed.data.map((website) => website.id)).not.toContain(t.sites.globex);

    const moved = await t.signedIn('moving@example.com', 'outlet');

    await t.hr().websites.save({
      recordId: 'store-2',
      name: 'outlet shop',
      origins: ['https://outlet.example.mn'],
    });
    await expect(
      t.app({ site: 'outlet', token: moved.accessToken }).api.customerAccount.me({}),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });
    expect(
      await t
        .app({ origin: 'https://outlet.example.mn', token: moved.accessToken })
        .api.customerAccount.me({}),
    ).toMatchObject({ id: moved.customer.id });

    await t.hr().websites.remove({ recordId: 'store-2' });
    await expect(t.hr().websites.remove({ recordId: 'store-2' })).rejects.toMatchObject({
      status: 400,
      code: 'UNKNOWN_WEBSITE',
    });
    await expect(
      t.app({ origin: null, token: moved.accessToken }).api.customerAccount.me({}),
    ).rejects.toMatchObject({ status: 401 });

    const before = await t.signedIn('leaving@example.com', 'globex');

    await t.other().plugins.uninstall({ name: 'hr' });

    await expect(
      t.app({ site: 'globex' }).api.customerAuth.sendCode({
        website: t.sites.globex,
        kind: 'email',
        value: 'late@example.com',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_WEBSITE' });

    // Its customers' tokens stop working with it.
    await expect(before.me.customerAccount.me({})).rejects.toMatchObject({ status: 401 });
    await expect(
      t.app({ site: 'globex' }).api.customerAuth.refresh({ refreshToken: before.refreshToken }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });
  });
});
