import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { aMinuteLater, useCustomers } from './customerAuth.fixture';
import { useTestDatabase } from './db';
import { urlOf } from './fakeGateway';

const GOOGLE_CLIENT = 'shop-web.apps.googleusercontent.com';

/** What a portal asks verify.mn to start. */
const SessionBody = z.object({ phone: z.string().optional(), text: z.string().optional() });

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

describe('portal sign-in with verify.mn and Google (decision 42)', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useCustomers();

  /** What verify.mn says about every session. */
  let replyStatus = 'PENDING';
  let sessions = 0;
  let googleKey: CryptoKey;

  beforeAll(async () => {
    const pair = await generateKeyPair('RS256');
    const jwk = { ...(await exportJWK(pair.publicKey)), kid: 'google-1', alg: 'RS256', use: 'sig' };

    googleKey = pair.privateKey;

    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);

      if (url === 'https://www.googleapis.com/oauth2/v3/certs') return json({ keys: [jwk] });

      if (!url.startsWith('https://api.verify.mn/')) return realFetch(input, init);

      if (url.endsWith('/sessions')) {
        const body = SessionBody.parse(
          JSON.parse(typeof init?.body === 'string' ? init.body : '{}'),
        );

        if (!body.phone || !body.text) return json({ message: 'phone and text' }, 400);

        sessions += 1;

        return json(
          {
            sessionId: `s${sessions}`,
            phone: body.phone,
            shortcode: '144773',
            text: body.text,
            smsUri: `sms:144773?body=${body.text}`,
            displayInstruction: `${body.phone} дугаараас ${body.text} гэж 144773 руу илгээнэ үү`,
            expiresAt: new Date(Date.now() + 300_000).toISOString(),
          },
          201,
        );
      }

      return json({ sessionStatus: replyStatus });
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  const googleToken = (claims: Record<string, unknown>, audience = GOOGLE_CLIENT) =>
    new SignJWT({ email_verified: true, ...claims })
      .setProtectedHeader({ alg: 'RS256', kid: 'google-1' })
      .setIssuer('https://accounts.google.com')
      .setAudience(audience)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(googleKey);

  it('has the customer text the code to verify.mn, and signs in once it says that phone sent it', async () => {
    const verify = await t.owner().integrations.connect({
      name: 'verify.mn',
      key: 'verify-mn',
      keys: { apiKey: 'vrf_test_key_123' },
    });

    await t.owner().portals.update({ id: t.sites.acme, phoneConnectionId: verify.id });

    const { api } = t.app();
    const phone = { portal: t.sites.acme, kind: 'phone' as const, value: '99112233' };

    expect((await api.customerAuth.methods({ portal: t.sites.acme })).phone).toBe('reply');

    // No account yet: the phone proves itself first, then hears it has none.
    const sent = await api.customerAuth.sendCode(phone);

    expect(sent.reply).toMatchObject({
      to: '144773',
      smsUri: `sms:144773?body=${sent.reply?.text}`,
    });

    const code = sent.reply?.text ?? '';

    await expect(api.customerAuth.signIn({ ...phone, code })).rejects.toMatchObject({
      status: 409,
      code: 'CODE_PENDING',
    });

    replyStatus = 'VERIFIED';

    await expect(api.customerAuth.signIn({ ...phone, code })).rejects.toMatchObject({
      status: 404,
      code: 'NO_ACCOUNT',
    });

    await aMinuteLater();
    replyStatus = 'PENDING';

    const signUp = await api.customerAuth.signUp({ ...phone, firstName: 'Bold' });
    const joinCode = signUp.reply?.text ?? '';

    // A code shown to be texted never works before verify.mn says it was.
    await expect(
      api.customerAuth.confirmSignUp({ ...phone, code: joinCode }),
    ).rejects.toMatchObject({ code: 'CODE_PENDING' });

    replyStatus = 'VERIFIED';

    const joined = await api.customerAuth.confirmSignUp({ ...phone, code: joinCode });

    expect(joined).toMatchObject({ created: true, customer: { firstName: 'Bold' } });

    await aMinuteLater();

    const again = await api.customerAuth.sendCode(phone);
    const signedIn = await api.customerAuth.signIn({ ...phone, code: again.reply?.text ?? '' });

    expect(signedIn.customer.id).toBe(joined.customer.id);
  });

  it('signs in with Google: joins the account with the same email, refuses tokens for other apps', async () => {
    const google = await t.owner().integrations.connect({
      name: 'Shop Google',
      key: 'google-sign-in',
      keys: { webClientId: GOOGLE_CLIENT },
    });

    await t.owner().portals.update({ id: t.sites.acme, googleConnectionId: google.id });

    const { api } = t.app();

    expect((await api.customerAuth.methods({ portal: t.sites.acme })).googleClientId).toBe(
      GOOGLE_CLIENT,
    );

    // Someone already signed up with the email gets Google added to the same account.
    const known = await t.signedIn('gerel@example.com');

    const viaGoogle = await api.customerAuth.social({
      portal: t.sites.acme,
      provider: 'google',
      token: await googleToken({ sub: 'g-100', email: 'Gerel@example.com', given_name: 'Gerel' }),
    });

    expect(viaGoogle).toMatchObject({ created: false, customer: { id: known.customer.id } });

    const me = t.app({ token: viaGoogle.accessToken }).api;

    expect(
      (await me.customerAccount.logins({})).data.map((login) => login.kind).toSorted(),
    ).toEqual(['email', 'google']);

    // A new person: a new customer and account, named by Google.
    const fresh = await api.customerAuth.social({
      portal: t.sites.acme,
      provider: 'google',
      token: await googleToken({ sub: 'g-200', email: 'tuul@example.com', given_name: 'Tuul' }),
    });

    expect(fresh).toMatchObject({ created: true, customer: { firstName: 'Tuul' } });

    await expect(
      api.customerAuth.social({
        portal: t.sites.acme,
        provider: 'google',
        token: await googleToken({ sub: 'g-300' }, 'someone-else.apps.googleusercontent.com'),
      }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_SOCIAL_TOKEN' });

    await expect(
      api.customerAuth.social({ portal: t.sites.acme, provider: 'apple', token: 'x.y.z' }),
    ).rejects.toMatchObject({ status: 400, code: 'SIGN_IN_UNAVAILABLE' });
  });
});
