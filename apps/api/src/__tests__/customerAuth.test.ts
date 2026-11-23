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

  it("signs a new customer up to a portal with an email code, in the portal's own form", async () => {
    const { api } = t.app();

    expect(
      await api.customerAuth.signUp({
        portal: t.sites.acme,
        kind: 'email',
        value: 'Shopper@Example.com',
        firstName: 'Bold',
        lastName: 'Bat',
      }),
    ).toEqual({ expiresInSeconds: 600, reply: null });

    const signedIn = await api.customerAuth.confirmSignUp({
      portal: t.sites.acme,
      kind: 'email',
      value: 'shopper@example.com',
      code: await lastCode('shopper@example.com'),
    });

    expect(signedIn).toMatchObject({
      created: true,
      expiresIn: 900,
      customer: { primaryEmail: 'shopper@example.com', firstName: 'Bold', lastName: 'Bat' },
    });

    // Plugins check the token with core's public keys; it names the portal.
    const jwks = createRemoteJWKSet(new URL(t.url('/core/v1/.well-known/jwks.json')));

    const { payload } = await jwtVerify(signedIn.accessToken, jwks, {
      issuer: 'erxes-core',
      audience: 'erxes-customer',
      typ: 'customer+jwt',
    });

    expect(payload).toMatchObject({ sub: signedIn.customer.id, pid: t.sites.acme });
    expect(
      await verifyCustomerToken(`Bearer ${signedIn.accessToken}`, { coreUrl: t.url('') }),
    ).toEqual({
      orgId: t.ids.org,
      customerId: signedIn.customer.id,
      portalId: t.sites.acme,
      agentId: null,
    });
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

    // The team sees who signed up, and on which portal.
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
          payload: { kind: 'email', portalId: t.sites.acme },
        },
        {
          type: 'core.customer.signed_in',
          subjectId: signedIn.customer.id,
          payload: { kind: 'email', portalId: t.sites.acme },
        },
      ]),
    );
  });

  it('keeps one customer with an account per portal, each signed up on its own', async () => {
    const known = await t.owner().customers.create({
      firstName: 'Saraa',
      primaryEmail: 'saraa@example.com',
    });

    // The first sign-in gives the login to the customer who already has the address.
    const shop = await t.signedIn('saraa@example.com');

    expect(shop).toMatchObject({ created: false, customer: { id: known.id, firstName: 'Saraa' } });

    // The outlet is another portal: the same customer, a new account and session.
    const outlet = await t.signedIn('saraa@example.com', 'outlet');

    expect(outlet.customer.id).toBe(known.id);

    // Each portal's token works on that portal only.
    await expect(
      t.app({ site: 'outlet', token: shop.accessToken }).api.customerAccount.me({}),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    expect(await shop.me.customerAccount.sessions({}).then((list) => list.data)).toHaveLength(1);

    const accounts = await t.owner().customerAccounts.list({ customerId: known.id });

    expect(accounts.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          portalId: t.sites.acme,
          portalName: 'acme shop',
          logins: ['saraa@example.com'],
          sessions: 1,
        }),
        expect.objectContaining({ portalId: t.sites.outlet, sessions: 1 }),
      ]),
    );
    expect(accounts.data).toHaveLength(2);
  });

  it("shows staff a customer's accounts, which only the customer signs out", async () => {
    const shop = await t.signedIn('leaving@example.com');
    const outlet = await t.signedIn('leaving@example.com', 'outlet');

    // Reading accounts is the member's organisation's: another one sees none.
    expect((await t.other().customerAccounts.list({ customerId: shop.customer.id })).data).toEqual(
      [],
    );

    // The customer signs out of the shop everywhere; the outlet stays signed in.
    await shop.me.customerAccount.signOutEverywhere({});
    await expect(shop.me.customerAccount.me({})).rejects.toMatchObject({ status: 401 });
    expect(await outlet.me.customerAccount.me({})).toMatchObject({ id: shop.customer.id });

    const accounts = await t.owner().customerAccounts.list({ customerId: shop.customer.id });

    const sessionsOn = (portalId: string) =>
      accounts.data.find((account) => account.portalId === portalId)?.sessions;

    expect(accounts.data).toHaveLength(2);
    expect(sessionsOn(t.sites.acme)).toBe(0);
    expect(sessionsOn(t.sites.outlet)).toBe(1);
  });

  it('counts wrong codes: five, then even the right one fails', async () => {
    const { api, join } = t.app();
    const address = { portal: t.sites.acme, kind: 'email', value: 'guess@example.com' } as const;

    await join('guess@example.com');
    await aMinuteLater();
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

  it("takes a portal's code on that portal only", async () => {
    await t.app().api.customerAuth.signUp({
      portal: t.sites.acme,
      kind: 'email',
      value: 'elsewhere@example.com',
      firstName: 'Elsewhere',
    });

    await expect(
      t.app({ site: 'outlet' }).api.customerAuth.confirmSignUp({
        portal: t.sites.outlet,
        kind: 'email',
        value: 'elsewhere@example.com',
        code: await lastCode('elsewhere@example.com'),
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_CODE' });
  });

  it('signs in accounts only: an address without one gets no code, with the same answer', async () => {
    const { api, signIn, join } = t.app();
    const address = { portal: t.sites.acme, kind: 'email', value: 'nobody@example.com' } as const;

    expect(await api.customerAuth.sendCode(address)).toEqual({
      expiresInSeconds: 600,
      reply: null,
    });
    await expect(lastCode('nobody@example.com')).rejects.toThrow(/no code was sent/);

    // Signed up, the same address signs in; signing up again signs in too.
    const joined = await join('nobody@example.com');

    await aMinuteLater();
    expect((await signIn('nobody@example.com')).customer.id).toBe(joined.customer.id);
    await aMinuteLater();
    expect(await join('nobody@example.com')).toMatchObject({
      created: false,
      customer: { id: joined.customer.id },
    });
  });

  it('limits codes per address and requests per network address', async () => {
    const address = { portal: t.sites.acme, kind: 'phone', value: '+97699112233' } as const;
    const { api } = t.app();
    const signUp = { ...address, firstName: 'Limit' };

    await api.customerAuth.signUp(signUp);
    // Right after: wait first.
    await expect(api.customerAuth.signUp(signUp)).rejects.toMatchObject({
      status: 429,
      code: 'TOO_MANY_CODES',
    });

    const flood = t.app();
    const answers = [];

    for (let index = 0; index < 11; index += 1) {
      answers.push(
        await flood.api.customerAuth
          .sendCode({ portal: t.sites.acme, kind: 'email', value: `flood${index}@example.com` })
          .then(
            () => 'sent',
            (error: unknown) => z.object({ code: z.string() }).parse(error).code,
          ),
      );
    }

    expect(answers.at(-1)).toBe('TOO_MANY_REQUESTS');
  });

  it("answers browsers only from the portal's origins", async () => {
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

    const send = { portal: t.sites.acme, kind: 'email', value: 'origin@example.com' } as const;

    await expect(
      t.app({ origin: 'https://evil.example.com' }).api.customerAuth.sendCode(send),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });
    // Another portal's page can't sign in to this one.
    await expect(
      t.app({ origin: siteOrigin('globex') }).api.customerAuth.sendCode(send),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    // The portal names its organisation.
    const globex = await t.signedIn('origin@example.com', 'globex');
    const acme = await t.signedIn('origin@example.com', 'acme');

    expect(globex.customer.id).not.toBe(acme.customer.id);

    // Acme's token from Globex's shop: refused.
    await expect(
      t.app({ site: 'globex', token: acme.accessToken }).api.customerAccount.me({}),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    // A mobile app or the portal's server sends no origin.
    const mobile = t.app({ origin: null });

    expect(await mobile.join('mobile@example.com')).toMatchObject({ created: true });
  });

  it("follows the plugin's portals: changed addresses, removed portals, uninstalls", async () => {
    await expect(
      t.app().api.customerAuth.sendCode({ portal: 'nope', kind: 'email', value: 'a@example.com' }),
    ).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_PORTAL' });

    // A plugin keeps its own portals; members only read them.
    const listed = await t.owner().portals.list({});

    expect(listed.data.map((portal) => portal.id)).toEqual(
      expect.arrayContaining([t.sites.acme, t.sites.outlet]),
    );
    expect(listed.data.map((portal) => portal.id)).not.toContain(t.sites.globex);

    const moved = await t.signedIn('moving@example.com', 'outlet');

    await t.hr().portals.save({
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

    await t.hr().portals.detach({ recordId: 'store-2' });
    await expect(t.hr().portals.detach({ recordId: 'store-2' })).rejects.toMatchObject({
      status: 400,
      code: 'UNKNOWN_PORTAL',
    });
    await expect(
      t.app({ origin: null, token: moved.accessToken }).api.customerAccount.me({}),
    ).rejects.toMatchObject({ status: 401 });

    const before = await t.signedIn('leaving@example.com', 'globex');

    await t.other().plugins.uninstall({ name: 'hr' });

    await expect(
      t.app({ site: 'globex' }).api.customerAuth.sendCode({
        portal: t.sites.globex,
        kind: 'email',
        value: 'late@example.com',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_PORTAL' });

    // Its customers' tokens stop working with it.
    await expect(before.me.customerAccount.me({})).rejects.toMatchObject({ status: 401 });
    await expect(
      t.app({ site: 'globex' }).api.customerAuth.refresh({ refreshToken: before.refreshToken }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });
  });
});
