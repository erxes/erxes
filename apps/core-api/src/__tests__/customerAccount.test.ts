import { describe, expect, it } from 'vite-plus/test';
import { lastCode, pkce, Tokens, useCustomers } from './customerAuth.fixture';
import { useTestDatabase } from './db';

describe('customer accounts (decision 42)', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useCustomers();

  it('keeps organisations apart: one address, two customers, two sessions', async () => {
    const b = t.browser();
    const acme = await b.signIn('both@example.com');
    const globex = await b.signIn('both@example.com', 'email', 'globex');

    expect(globex.customer.id).not.toBe(acme.customer.id);

    // The browser is now signed in to Globex: Acme's app sends it to sign in again.
    const { challenge } = pkce();

    expect((await t.authorize(challenge, b.cookie())).location.pathname).toBe('/customer-sign-in');

    // Signed in to Acme: the app gets a code, unless it asks to sign in again (`prompt=login`).
    const c = t.browser();

    await c.signIn('prompt@example.com');
    expect(
      (await t.authorize(challenge, c.cookie())).location.searchParams.get('code'),
    ).toBeTruthy();
    expect((await t.authorize(challenge, c.cookie(), { prompt: 'login' })).location.pathname).toBe(
      '/customer-sign-in',
    );
  });

  it('rotates refresh tokens and ends the session when an old one comes back', async () => {
    const b = t.browser();

    await b.signIn('rotate@example.com');

    const first = await t.appTokens(b.cookie());

    const second = Tokens.parse((await t.refresh(first.refresh_token)).body);

    expect(second.refresh_token).not.toBe(first.refresh_token);
    expect((await t.client(second.access_token).customerAccount.me({})).primaryEmail).toBe(
      'rotate@example.com',
    );

    // The first one again: it leaked. The session ends, and its access tokens with it.
    expect((await t.refresh(first.refresh_token)).status).toBe(400);
    expect((await t.refresh(second.refresh_token)).status).toBe(400);
    await expect(t.client(second.access_token).customerAccount.me({})).rejects.toMatchObject({
      status: 401,
    });
  });

  it('lets customers manage their profile, logins and sessions', async () => {
    const b = t.browser();

    await b.signIn('owner-of-it@example.com');

    const tokens = await t.appTokens(b.cookie());
    const me = t.client(tokens.access_token);

    expect(
      await me.customerAccount.update({ firstName: 'Bold', birthDate: '1990-04-01' }),
    ).toMatchObject({ firstName: 'Bold', birthDate: '1990-04-01' });

    // A phone, proved with a code by SMS.
    await me.customerAccount.addLogin({ kind: 'phone', value: '+976 8811 2233' });
    await expect(
      me.customerAccount.confirmLogin({ kind: 'phone', value: '+97688112233', code: '000000' }),
    ).rejects.toMatchObject({ code: 'INVALID_CODE' });

    const phone = await me.customerAccount.confirmLogin({
      kind: 'phone',
      value: '+97688112233',
      code: await lastCode('+97688112233'),
    });

    expect(phone).toMatchObject({ kind: 'phone', value: '+97688112233' });
    expect((await me.customerAccount.me({})).primaryPhone).toBe('+97688112233');

    // Someone else's login can't be added.
    await t.browser().signIn('taken@example.com');
    await expect(
      me.customerAccount.addLogin({ kind: 'email', value: 'taken@example.com' }),
    ).rejects.toMatchObject({ status: 409, code: 'LOGIN_TAKEN' });

    // Signs in with the phone too, then drops the email. The last one stays.
    const logins = (await me.customerAccount.logins({})).data;

    expect(logins.map((login) => login.kind)).toEqual(['email', 'phone']);

    const email = logins.find((login) => login.kind === 'email');

    await me.customerAccount.removeLogin({ id: email?.id ?? '' });
    await expect(me.customerAccount.removeLogin({ id: phone.id })).rejects.toMatchObject({
      status: 409,
      code: 'LAST_LOGIN',
    });

    // Sessions: the sign-in page's browser and this app.
    const sessions = (await me.customerAccount.sessions({})).data;

    expect(sessions.map((session) => [session.clientId, session.current])).toEqual(
      expect.arrayContaining([
        ['hr', true],
        [null, false],
      ]),
    );
    expect(sessions).toHaveLength(2);

    const page = sessions.find((session) => session.clientId === null);

    await me.customerAccount.revokeSession({ id: page?.id ?? '' });

    const { challenge } = pkce();

    expect((await t.authorize(challenge, b.cookie())).location.pathname).toBe('/customer-sign-in');

    await me.customerAccount.signOutEverywhere({});
    await expect(me.customerAccount.me({})).rejects.toMatchObject({ status: 401 });
  });
});
