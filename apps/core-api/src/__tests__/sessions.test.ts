import { newId, users } from '@erxes/core-db';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { hashPassword } from '~/lib/crypto';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
import { useTestServer } from './support';

const OWNER = { email: 'owner@acme.mn', password: 'Owner-pass-1' };
const MEMBER = 'member@acme.mn';

/** Sessions end when they should: password change or reset, disable, sign out everywhere. */
describe('session security', () => {
  useTestDatabase();

  const server = useTestServer();
  // A second app on the same database, as another replica would be.
  const replica = useTestServer();
  let memberId = '';

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: OWNER.email, passwordHash: await hashPassword(OWNER.password) },
    });

    memberId = newId();
    await adminDb()
      .insert(users)
      .values({
        id: memberId,
        orgId: acme.organization.id,
        email: MEMBER,
        role: 'member',
        status: 'active',
        passwordHash: await hashPassword('Member-pass-1'),
      });
  });

  /** A browser signed in with these credentials. */
  const signedIn = async (email: string, password: string) => {
    const browser = server.browser();

    await browser.api.auth.signIn({ email, password });

    return browser;
  };

  /** Whether a browser holding `cookie` is still signed in. */
  const signedInWith = (cookie: string) =>
    server
      .browser(cookie)
      .api.auth.me({})
      .then(
        () => true,
        () => false,
      );

  /** A sign-in from one outside address: odd attempts go to the replica, even ones to the first app. */
  const signInFrom = (index: number) =>
    fetch((index % 2 ? replica : server).url('/core/v1/auth/sign-in'), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7' },
      body: '{}',
    });

  it('ends other sessions when a member changes their password, keeping this one', async () => {
    const laptop = await signedIn(MEMBER, 'Member-pass-1');
    const phone = await signedIn(MEMBER, 'Member-pass-1');
    const before = laptop.cookie();

    await laptop.api.auth.changePassword({
      currentPassword: 'Member-pass-1',
      newPassword: 'Member-pass-2',
    });

    expect(await signedInWith(phone.cookie())).toBe(false);
    expect(await signedInWith(before)).toBe(false);
    // The laptop got a fresh cookie with the answer.
    expect(laptop.cookie()).not.toBe(before);
    expect(await signedInWith(laptop.cookie())).toBe(true);
  });

  it('ends sessions when an admin resets the password, and when the member is disabled; enabling does not revive them', async () => {
    const owner = await signedIn(OWNER.email, OWNER.password);
    const before = await signedIn(MEMBER, 'Member-pass-2');

    await owner.api.users.setPassword({ id: memberId, password: 'Member-pass-3' });
    expect(await signedInWith(before.cookie())).toBe(false);

    const after = await signedIn(MEMBER, 'Member-pass-3');

    await owner.api.users.disable({ id: memberId });
    await owner.api.users.enable({ id: memberId });
    expect(await signedInWith(after.cookie())).toBe(false);
  });

  it('signs out everywhere', async () => {
    const first = await signedIn(MEMBER, 'Member-pass-3');
    const second = await signedIn(MEMBER, 'Member-pass-3');
    const cookie = first.cookie();

    await first.api.auth.signOutEverywhere({});
    expect(await signedInWith(second.cookie())).toBe(false);
    expect(await signedInWith(cookie)).toBe(false);
  });

  it('refuses dates that do not exist with 400, not a database error', async () => {
    const { api } = await signedIn(OWNER.email, OWNER.password);

    for (const birthDate of ['2026-99-99', '2026-02-30'])
      await expect(api.users.update({ id: memberId, birthDate })).rejects.toMatchObject({
        status: 400,
      });

    expect(await api.users.update({ id: memberId, birthDate: '2024-02-29' })).toMatchObject({
      birthDate: '2024-02-29',
    });
  });

  it('locks an account after 10 failed sign-ins in 15 minutes', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1)
      await expect(
        server.browser().api.auth.signIn({ email: OWNER.email, password: `wrong-${attempt}` }),
      ).rejects.toMatchObject({ status: 401 });

    await expect(server.browser().api.auth.signIn(OWNER)).rejects.toMatchObject({
      status: 429,
      code: 'TOO_MANY_ATTEMPTS',
    });
  });

  it('counts sign-ins per address across replicas: 20 a minute in total, not per app', async () => {
    for (let index = 0; index < 20; index += 1)
      expect((await signInFrom(index)).status).not.toBe(429);

    const limited = await signInFrom(20);

    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(await limited.json()).toMatchObject({
      defined: false,
      code: 'TOO_MANY_REQUESTS',
      status: 429,
    });
  });
});
