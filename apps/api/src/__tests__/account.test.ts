import { users } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { hashPassword } from '~/lib/crypto';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** What a member changes on their own account. */
describe('own account', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('changes my password only with the current one, and lists my sign-ins', async () => {
    await adminDb()
      .update(users)
      .set({ passwordHash: await hashPassword('Owner-pass-123') })
      .where(eq(users.id, t.ids.owner));

    const before = t.client(await t.token());

    const change = (currentPassword: string, newPassword: string) =>
      t.owner().auth.changePassword({ currentPassword, newPassword });

    await expect(change('nope', 'Owner-pass-456')).rejects.toMatchObject({
      code: 'WRONG_PASSWORD',
    });
    await expect(change('Owner-pass-123', 'Owner-pass-123')).rejects.toMatchObject({
      code: 'SAME_PASSWORD',
    });
    await change('Owner-pass-123', 'Owner-pass-456');
    // The change ended every other session, this bearer token's too.
    await expect(before.auth.me({})).rejects.toMatchObject({ status: 401 });

    // A failed and a successful sign-in show up in my list, not in others'.
    const signIn = (password: string) =>
      t.client().auth.signIn({ email: 'owner@acme.mn', password, subdomain: 'acme' });

    await expect(signIn('Owner-pass-123')).rejects.toMatchObject({ status: 401 });
    await signIn('Owner-pass-456');

    const mine = await t.owner().auth.signIns({});

    expect(mine.data.map((entry) => entry.success).slice(0, 2)).toEqual([true, false]);
    expect((await t.member().auth.signIns({})).data).toHaveLength(0);
  });

  it('lets a member without a password set their first one, with no current one', async () => {
    await adminDb().update(users).set({ passwordHash: null }).where(eq(users.id, t.ids.owner));

    expect((await t.owner().auth.me({})).hasPassword).toBe(false);
    await expect(t.owner().auth.changePassword({ newPassword: 'weak' })).rejects.toMatchObject({
      status: 400,
    });
    await t.owner().auth.changePassword({ newPassword: 'Owner-pass-123' });

    const signIn = (password: string) =>
      t.client().auth.signIn({ email: 'owner@acme.mn', password, subdomain: 'acme' });

    await signIn('Owner-pass-123');
    expect((await t.owner().auth.me({})).hasPassword).toBe(true);

    // Once there is one, changing it needs it.
    await expect(
      t.owner().auth.changePassword({ newPassword: 'Other-pass-456' }),
    ).rejects.toMatchObject({
      code: 'WRONG_PASSWORD',
    });
    await expect(signIn('Other-pass-456')).rejects.toMatchObject({ status: 401 });
  });

  it('lets a member edit their own profile, not their role', async () => {
    const saved = await t.member().users.update({
      id: t.ids.member,
      firstName: 'Bold',
      lastName: 'Bat',
      links: { github: 'https://github.com/bold' },
    });

    expect(saved).toMatchObject({
      firstName: 'Bold',
      lastName: 'Bat',
      links: { github: 'https://github.com/bold' },
    });
    await expect(
      t.member().users.update({ id: t.ids.member, role: 'admin' }),
    ).rejects.toMatchObject({ code: 'OWN_ROLE' });
  });
});
