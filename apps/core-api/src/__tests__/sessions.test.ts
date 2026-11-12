import { newId, users } from '@erxes/core-db';
import { beforeAll, expect, it } from 'vite-plus/test';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, describeWithDb, useTestDatabase } from './db';
import { useTestServer } from './support';

const OWNER = { email: 'owner@acme.mn', password: 'Owner-pass-1' };
const MEMBER = 'member@acme.mn';

/** Sessions end when they should: password change or reset, disable, sign out everywhere. */
describeWithDb('session security', () => {
  useTestDatabase();

  const server = useTestServer();
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
});
