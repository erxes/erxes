import { db, newId, users } from '@erxes/core-db';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { sessionToken, useTestDatabase, useTestServer } from './support';

/** Sessions end when they should: password change or reset, disable, sign out everywhere. */
describe('session security', () => {
  useTestDatabase();

  const server = useTestServer();
  let memberId = '';

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn', passwordHash: await hashPassword('Owner-pass-1') },
    });

    memberId = newId();

    await db()
      .insert(users)
      .values({
        id: memberId,
        orgId: acme.organization.id,
        email: 'member@acme.mn',
        role: 'member',
        status: 'active',
        passwordHash: await hashPassword('Member-pass-1'),
      });
  });

  // Raw HTTP: the session token comes back only in the cookie.
  const signIn = async (email: string, password: string) => {
    const response = await fetch(server.url('/core/v1/auth/sign-in'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    expect(response.status).toBe(200);

    return sessionToken(response);
  };

  const as = server.client;

  const signedOut = { status: 401 };

  it('ends other sessions when a member changes their password, keeping this one', async () => {
    const laptop = await signIn('member@acme.mn', 'Member-pass-1');
    const phone = as(await signIn('member@acme.mn', 'Member-pass-1'));

    // Raw HTTP with the cookie: only a browser session is renewed, in the cookie.
    const changed = await fetch(server.url('/core/v1/auth/password'), {
      method: 'POST',
      headers: {
        cookie: `erxes_session=${laptop}`,
        'content-type': 'application/json',
        'sec-fetch-site': 'same-origin',
      },
      body: JSON.stringify({ currentPassword: 'Member-pass-1', newPassword: 'Member-pass-2' }),
    });

    expect(changed.status).toBe(200);

    await expect(phone.auth.me()).rejects.toMatchObject(signedOut);
    await expect(as(laptop).auth.me()).rejects.toMatchObject(signedOut);
    await expect(as(sessionToken(changed)).auth.me()).resolves.toMatchObject({
      user: { email: 'member@acme.mn' },
    });
  });

  it('ends sessions when an admin resets the password, and when the member is disabled; enabling does not revive them', async () => {
    const owner = as(await signIn('owner@acme.mn', 'Owner-pass-1'));
    let member = as(await signIn('member@acme.mn', 'Member-pass-2'));

    await owner.users.setPassword({ id: memberId, password: 'Member-pass-3' });
    await expect(member.auth.me()).rejects.toMatchObject(signedOut);

    member = as(await signIn('member@acme.mn', 'Member-pass-3'));
    await owner.users.disable({ id: memberId });
    await owner.users.enable({ id: memberId });
    await expect(member.auth.me()).rejects.toMatchObject(signedOut);
  });

  it('signs out everywhere', async () => {
    const first = as(await signIn('member@acme.mn', 'Member-pass-3'));
    const second = as(await signIn('member@acme.mn', 'Member-pass-3'));

    await first.auth.signOutEverywhere();
    await expect(second.auth.me()).rejects.toMatchObject(signedOut);
    await expect(first.auth.me()).rejects.toMatchObject(signedOut);
  });

  it('refuses dates that do not exist with 400, not a database error', async () => {
    const owner = as(await signIn('owner@acme.mn', 'Owner-pass-1'));

    for (const birthDate of ['2026-99-99', '2026-02-30']) {
      await expect(owner.users.update({ id: memberId, birthDate })).rejects.toMatchObject({
        status: 400,
      });
    }

    await expect(
      owner.users.update({ id: memberId, birthDate: '2024-02-29' }),
    ).resolves.toMatchObject({ birthDate: '2024-02-29' });
  });

  it('locks an account after 10 failed sign-ins in 15 minutes', async () => {
    const api = as();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await expect(
        api.auth.signIn({ email: 'owner@acme.mn', password: `wrong-${attempt}` }),
      ).rejects.toMatchObject(signedOut);
    }

    await expect(
      api.auth.signIn({ email: 'owner@acme.mn', password: 'Owner-pass-1' }),
    ).rejects.toMatchObject({ status: 429, code: 'TOO_MANY_ATTEMPTS' });
  });
});
