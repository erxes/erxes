import { events } from '@erxes/core-db';
import { verifyCustomerToken } from '@erxes/plugin-sdk';
import { inArray } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { appOrigin, lastCode, useCustomers } from './customerAuth.fixture';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';

describe('customer sign-in (decision 42)', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useCustomers();

  it("signs a new customer up with an email code, in the app's own form", async () => {
    const { api } = t.app();

    expect(
      await api.customerAuth.sendCode({
        clientId: 'hr',
        kind: 'email',
        value: 'Shopper@Example.com',
      }),
    ).toEqual({ expiresInSeconds: 600 });

    const signedIn = await api.customerAuth.signIn({
      clientId: 'hr',
      kind: 'email',
      value: 'shopper@example.com',
      code: await lastCode('shopper@example.com'),
    });

    expect(signedIn).toMatchObject({
      created: true,
      expiresIn: 900,
      customer: { primaryEmail: 'shopper@example.com' },
    });

    // Plugins check the token with core's public keys.
    const jwks = createRemoteJWKSet(new URL(t.url('/core/v1/.well-known/jwks.json')));

    const { payload } = await jwtVerify(signedIn.accessToken, jwks, {
      issuer: 'erxes-core',
      audience: 'erxes-customer',
      typ: 'customer+jwt',
    });

    expect(payload).toMatchObject({ sub: signedIn.customer.id, client_id: 'hr' });
    expect(
      await verifyCustomerToken(`Bearer ${signedIn.accessToken}`, { coreUrl: t.url('') }),
    ).toEqual({ orgId: t.ids.org, customerId: signedIn.customer.id, clientId: 'hr' });
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

    // The team sees who signed up, and in which app.
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
          payload: { kind: 'email', app: 'hr' },
        },
        {
          type: 'core.customer.signed_in',
          subjectId: signedIn.customer.id,
          payload: { kind: 'email', app: 'hr' },
        },
      ]),
    );
  });

  it('gives the login to the customer who already has the address', async () => {
    const known = await t.owner().customers.create({
      firstName: 'Saraa',
      primaryEmail: 'saraa@example.com',
    });

    expect(await t.app().signIn('saraa@example.com')).toMatchObject({
      created: false,
      customer: { id: known.id, firstName: 'Saraa' },
    });
  });

  it('counts wrong codes: five, then even the right one fails', async () => {
    const { api } = t.app();
    const address = { clientId: 'hr', kind: 'email', value: 'guess@example.com' } as const;

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

  it('limits codes per address and requests per network address', async () => {
    const address = { clientId: 'hr', kind: 'phone', value: '+97699112233' } as const;
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
          .sendCode({ clientId: 'hr', kind: 'email', value: `flood${index}@example.com` })
          .then(
            () => 'sent',
            (error: unknown) => z.object({ code: z.string() }).parse(error).code,
          ),
      );
    }

    expect(answers.at(-1)).toBe('TOO_MANY_REQUESTS');
  });

  it("answers browsers only from the app's origins", async () => {
    const preflight = (origin: string) =>
      fetch(t.url('/core/v1/customer-auth/code'), {
        method: 'OPTIONS',
        headers: {
          origin,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type',
        },
      });

    const allowed = await preflight(appOrigin());

    expect(allowed.status).toBe(204);
    expect(allowed.headers.get('access-control-allow-origin')).toBe(appOrigin());
    expect(allowed.headers.get('access-control-allow-credentials')).toBeNull();
    expect((await preflight('https://evil.example.com')).status).toBe(403);

    const send = { clientId: 'hr', kind: 'email', value: 'origin@example.com' } as const;

    await expect(
      t.app({ origin: 'https://evil.example.com' }).api.customerAuth.sendCode(send),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    // Globex's shop names Globex, whatever the request says.
    const globex = await t.signedIn('origin@example.com', 'globex');
    const acme = await t.signedIn('origin@example.com', 'acme');

    expect(globex.customer.id).not.toBe(acme.customer.id);

    // Acme's token from Globex's shop: refused.
    await expect(
      t.app({ origin: appOrigin('globex'), token: acme.accessToken }).api.customerAccount.me({}),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    // A mobile app sends no origin: it names the organisation.
    const mobile = t.app({ origin: null }).api;

    await mobile.customerAuth.sendCode({
      ...send,
      value: 'mobile@example.com',
      organization: 'acme',
    });

    expect(
      await mobile.customerAuth.signIn({
        clientId: 'hr',
        organization: 'acme',
        kind: 'email',
        value: 'mobile@example.com',
        code: await lastCode('mobile@example.com'),
      }),
    ).toMatchObject({ created: true });
  });

  it('signs customers in only to apps the organisation has', async () => {
    await expect(
      t
        .app()
        .api.customerAuth.sendCode({ clientId: 'nope', kind: 'email', value: 'a@example.com' }),
    ).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_APP' });

    const before = await t.signedIn('leaving@example.com', 'globex');

    await t.other().plugins.uninstall({ name: 'hr' });

    await expect(
      t
        .app({ origin: appOrigin('globex') })
        .api.customerAuth.sendCode({ clientId: 'hr', kind: 'email', value: 'late@example.com' }),
    ).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_APP' });

    // Its customers' tokens stop working with it.
    await expect(before.me.customerAccount.me({})).rejects.toMatchObject({ status: 401 });
    await expect(
      t
        .app({ origin: appOrigin('globex') })
        .api.customerAuth.refresh({ clientId: 'hr', refreshToken: before.refreshToken }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });
  });
});
