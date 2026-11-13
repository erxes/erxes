import { events } from '@erxes/core-db';
import { verifyCustomerToken } from '@erxes/plugin-sdk';
import { inArray } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { lastCode, pkce, REDIRECT, Tokens, useCustomers } from './customerAuth.fixture';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';

describe('customer sign-in (decision 42)', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useCustomers();

  it('signs a new customer up with an email code, then into the app with PKCE', async () => {
    const b = t.browser();

    expect(await b.api.customerAuth.config({ organization: 'acme' })).toEqual({
      organization: { name: 'Acme', subdomain: 'acme' },
      kinds: ['email', 'phone'],
    });

    // Not signed in yet: to core's sign-in page, which comes back here after.
    const { verifier, challenge } = pkce();
    const first = await t.authorize(challenge, '');

    expect(first.status).toBe(302);
    expect(first.location.pathname).toBe('/customer-sign-in');
    expect(first.location.searchParams.get('organization')).toBe('acme');
    expect(first.location.searchParams.get('next')).toMatch(
      /^\/core\/v1\/customer-oauth\/authorize\?/,
    );

    // An address the app didn't register is never redirected to.
    const evil = await t.authorize(challenge, '', { redirect_uri: 'https://evil.example.com/cb' });

    expect(evil.status).toBe(400);

    expect(
      await b.api.customerAuth.sendCode({
        organization: 'acme',
        kind: 'email',
        value: 'Shopper@Example.com',
      }),
    ).toEqual({ expiresInSeconds: 600 });

    const signedIn = await b.api.customerAuth.signIn({
      organization: 'acme',
      kind: 'email',
      value: 'shopper@example.com',
      code: await lastCode('shopper@example.com'),
    });

    expect(signedIn).toMatchObject({
      created: true,
      customer: { primaryEmail: 'shopper@example.com' },
    });
    expect(b.cookie()).toMatch(/^erxes_customer=/);

    // Signed in: straight back to the app with a code.
    const back = await t.authorize(challenge, b.cookie());

    expect(back.location.origin + back.location.pathname).toBe(REDIRECT);
    expect(back.location.searchParams.get('state')).toBe('s-1');

    const code = back.location.searchParams.get('code') ?? '';

    const exchange = (codeVerifier: string) =>
      t.token({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT,
        code_verifier: codeVerifier,
      });

    expect((await exchange('wrong')).status).toBe(400);

    const tokens = Tokens.parse((await exchange(verifier)).body);

    expect(tokens.expires_in).toBe(900);
    // A code works once.
    expect((await exchange(verifier)).status).toBe(400);

    // Plugins check the token with core's public keys.
    const jwks = createRemoteJWKSet(new URL(t.url('/core/v1/.well-known/jwks.json')));

    const { payload } = await jwtVerify(tokens.access_token, jwks, {
      issuer: 'erxes-core',
      audience: 'erxes-customer',
      typ: 'customer+jwt',
    });

    expect(payload).toMatchObject({ sub: signedIn.customer.id, client_id: 'hr' });
    expect(
      await verifyCustomerToken(`Bearer ${tokens.access_token}`, { coreUrl: t.url('') }),
    ).toEqual({ orgId: t.ids.org, customerId: signedIn.customer.id, clientId: 'hr' });
    // A member's plugin token is not a customer's.
    await expect(
      verifyCustomerToken(`Bearer ${await t.pluginToken(undefined, t.ids.org)}`, {
        coreUrl: t.url(''),
      }),
    ).rejects.toThrow(/typ/);

    const me = t.client(tokens.access_token);

    expect(await me.customerAccount.me({})).toMatchObject({
      id: signedIn.customer.id,
      primaryEmail: 'shopper@example.com',
    });

    // A customer token opens nothing else, and no other token opens /customer/*.
    await expect(me.customers.list({})).rejects.toMatchObject({ status: 401 });
    await expect(t.owner().customerAccount.me({})).rejects.toMatchObject({ status: 401 });
    await expect(t.hr().customerAccount.me({})).rejects.toMatchObject({ status: 401 });

    // The team sees who signed up.
    await settle();

    const published = await adminDb()
      .select({ type: events.type, subjectId: events.subjectId })
      .from(events)
      .where(inArray(events.type, ['core.customer.signed_up', 'core.customer.signed_in']));

    expect(published).toEqual(
      expect.arrayContaining([
        { type: 'core.customer.signed_up', subjectId: signedIn.customer.id },
        { type: 'core.customer.signed_in', subjectId: signedIn.customer.id },
      ]),
    );
  });

  it('gives the login to the customer who already has the address', async () => {
    const known = await t.owner().customers.create({
      firstName: 'Saraa',
      primaryEmail: 'saraa@example.com',
    });

    const signedIn = await t.browser().signIn('saraa@example.com');

    expect(signedIn).toMatchObject({
      created: false,
      customer: { id: known.id, firstName: 'Saraa' },
    });
  });

  it('counts wrong codes: five, then even the right one fails', async () => {
    const b = t.browser();
    const address = { organization: 'acme', kind: 'email', value: 'guess@example.com' } as const;

    await b.api.customerAuth.sendCode(address);

    const right = await lastCode('guess@example.com');
    const wrong = right === '000000' ? '111111' : '000000';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(b.api.customerAuth.signIn({ ...address, code: wrong })).rejects.toMatchObject({
        status: 400,
        code: 'INVALID_CODE',
      });
    }

    await expect(b.api.customerAuth.signIn({ ...address, code: right })).rejects.toMatchObject({
      code: 'INVALID_CODE',
    });
  });

  it('limits codes per address and requests per network address', async () => {
    const b = t.browser();
    const address = { organization: 'acme', kind: 'phone', value: '+97699112233' } as const;

    await b.api.customerAuth.sendCode(address);
    // Right after: wait first. Unknown and known addresses answer alike.
    await expect(b.api.customerAuth.sendCode(address)).rejects.toMatchObject({
      status: 429,
      code: 'TOO_MANY_CODES',
    });

    const flood = t.browser();
    const answers = [];

    for (let index = 0; index < 11; index += 1) {
      answers.push(
        await flood.api.customerAuth
          .sendCode({ organization: 'acme', kind: 'email', value: `flood${index}@example.com` })
          .then(
            () => 'sent',
            (error: unknown) => z.object({ code: z.string() }).parse(error).code,
          ),
      );
    }

    expect(answers.at(-1)).toBe('TOO_MANY_REQUESTS');
  });
});
