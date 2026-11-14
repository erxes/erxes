import { describe, expect, it } from 'vite-plus/test';
import { aMinuteLater, lastCode, useCustomers } from './customerAuth.fixture';
import { useTestDatabase } from './db';

describe('customer accounts (decision 42)', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useCustomers();

  it('keeps organisations apart: one address, two customers', async () => {
    const acme = await t.signedIn('both@example.com', 'acme');
    const globex = await t.signedIn('both@example.com', 'globex');

    expect(globex.customer.id).not.toBe(acme.customer.id);
    expect((await acme.me.customerAccount.me({})).id).toBe(acme.customer.id);
    expect((await globex.me.customerAccount.me({})).id).toBe(globex.customer.id);
  });

  it('rotates refresh tokens and ends the session when an old one comes back', async () => {
    const first = await t.signedIn('rotate@example.com');
    const { api } = t.app();

    const second = await api.customerAuth.refresh({
      clientId: 'hr',
      refreshToken: first.refreshToken,
    });

    expect(second.refreshToken).not.toBe(first.refreshToken);
    expect(
      (await t.app({ token: second.accessToken }).api.customerAccount.me({})).primaryEmail,
    ).toBe('rotate@example.com');

    // Another app can't use it.
    await expect(
      api.customerAuth.refresh({ clientId: 'shop', refreshToken: second.refreshToken }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });

    // The first one again: it leaked. The session ends, and its access tokens with it.
    await expect(
      api.customerAuth.refresh({ clientId: 'hr', refreshToken: first.refreshToken }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });
    await expect(
      api.customerAuth.refresh({ clientId: 'hr', refreshToken: second.refreshToken }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });
    await expect(
      t.app({ token: second.accessToken }).api.customerAccount.me({}),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('signs the app out with its refresh token', async () => {
    const session = await t.signedIn('leave@example.com');
    const { api } = t.app();

    expect(await api.customerAuth.signOut({ refreshToken: session.refreshToken })).toEqual({
      ok: true,
    });
    // Unknown tokens get the same answer.
    expect(await api.customerAuth.signOut({ refreshToken: 'nothing.here' })).toEqual({ ok: true });

    await expect(session.me.customerAccount.me({})).rejects.toMatchObject({ status: 401 });
    await expect(
      api.customerAuth.refresh({ clientId: 'hr', refreshToken: session.refreshToken }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });
  });

  it('lets customers manage their profile, logins and sessions', async () => {
    const { me } = await t.signedIn('owner-of-it@example.com');

    await aMinuteLater();

    const elsewhere = await t.signedIn('owner-of-it@example.com');

    expect(
      await me.customerAccount.update({ firstName: 'Bold', birthDate: '1990-04-01' }),
    ).toMatchObject({ firstName: 'Bold', birthDate: '1990-04-01' });

    // A phone, proved with a code by SMS.
    await me.customerAccount.addLogin({ kind: 'phone', value: '+976 8811 2233' });
    await expect(
      me.customerAccount.confirmLogin({ kind: 'phone', value: '+97688112233', code: '000000' }),
    ).rejects.toMatchObject({ code: 'INVALID_CODE' });

    const added = await me.customerAccount.confirmLogin({
      kind: 'phone',
      value: '+97688112233',
      code: await lastCode('+97688112233'),
    });

    expect(added).toMatchObject({ kind: 'phone', value: '+97688112233' });
    expect((await me.customerAccount.me({})).primaryPhone).toBe('+97688112233');

    // Someone else's login can't be added.
    await t.signedIn('taken@example.com');
    await expect(
      me.customerAccount.addLogin({ kind: 'email', value: 'taken@example.com' }),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN' });

    // Signs in with the phone too, then drops the email. The last one stays.
    const logins = (await me.customerAccount.logins({})).data;

    expect(logins.map((login) => login.kind)).toEqual(['email', 'phone']);

    const email = logins.find((login) => login.kind === 'email');

    await me.customerAccount.removeLogin({ id: email?.id ?? '' });
    await expect(me.customerAccount.removeLogin({ id: added.id })).rejects.toMatchObject({
      status: 409,
      code: 'LAST_LOGIN',
    });

    // Two sign-ins to the app: this one and the one elsewhere.
    const sessions = (await me.customerAccount.sessions({})).data;

    expect(sessions.map((session) => [session.clientId, session.current])).toEqual(
      expect.arrayContaining([
        ['hr', true],
        ['hr', false],
      ]),
    );
    expect(sessions).toHaveLength(2);

    const other = sessions.find((session) => !session.current);

    await me.customerAccount.revokeSession({ id: other?.id ?? '' });
    await expect(elsewhere.me.customerAccount.me({})).rejects.toMatchObject({ status: 401 });

    await me.customerAccount.signOutEverywhere({});
    await expect(me.customerAccount.me({})).rejects.toMatchObject({ status: 401 });
  });
});
