import { apiKeys, users } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('API keys', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** Gives the member a role that may create keys. */
  beforeAll(async () => {
    const role = await t.owner().roles.create({
      name: 'Integrator',
      permissions: ['team.view', 'contacts.view', 'api_keys.create'],
    });

    await adminDb().update(users).set({ role: role.key }).where(eq(users.id, t.ids.member));
  });

  it('acts as its member until it is revoked', async () => {
    const { apiKey, key } = await t.member().apiKeys.create({ name: 'Sync', lifetimeDays: 30 });

    expect(key).toMatch(/^erxes_/);
    expect(apiKey).toMatchObject({ name: 'Sync', userId: t.ids.member, lastUsedAt: null });
    expect(apiKey.expiresAt).not.toBeNull();

    const listed = await t.client(key).users.list({});

    expect(listed.data.length).toBeGreaterThan(0);

    const [row] = await adminDb().select().from(apiKeys).where(eq(apiKeys.id, apiKey.id));

    expect(row?.lastUsedAt).not.toBeNull();

    // The member's role applies: no contacts.create.
    await expect(t.client(key).customers.create({ firstName: 'No' })).rejects.toMatchObject({
      status: 403,
    });

    // A key can't manage keys.
    await expect(t.client(key).apiKeys.list()).rejects.toMatchObject({
      status: 403,
      code: 'SESSION_REQUIRED',
    });

    expect(await t.member().apiKeys.remove({ id: apiKey.id })).toEqual({ ok: true });
    await expect(t.client(key).users.list({})).rejects.toMatchObject({ status: 401 });
  });

  it('refuses a wrong secret, an expired key and a disabled member', async () => {
    const { apiKey, key } = await t.member().apiKeys.create({ name: 'Short', lifetimeDays: null });

    expect(apiKey.expiresAt).toBeNull();
    await expect(t.client(`${key}x`).users.list({})).rejects.toMatchObject({ status: 401 });

    await adminDb().update(users).set({ status: 'disabled' }).where(eq(users.id, t.ids.member));
    await expect(t.client(key).users.list({})).rejects.toMatchObject({ status: 401 });
    await adminDb().update(users).set({ status: 'active' }).where(eq(users.id, t.ids.member));
    await t.client(key).users.list({});

    await adminDb()
      .update(apiKeys)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(apiKeys.id, apiKey.id));
    await expect(t.client(key).users.list({})).rejects.toMatchObject({ status: 401 });

    await t.member().apiKeys.remove({ id: apiKey.id });
  });

  it('needs api_keys.create to make one', async () => {
    await adminDb().update(users).set({ role: 'member' }).where(eq(users.id, t.ids.disabled));
    await adminDb().update(users).set({ status: 'active' }).where(eq(users.id, t.ids.disabled));

    await expect(
      t.client({ user: t.ids.disabled, org: t.ids.org }).apiKeys.create({
        name: 'No',
        lifetimeDays: 30,
      }),
    ).rejects.toMatchObject({ status: 403 });

    await adminDb().update(users).set({ status: 'disabled' }).where(eq(users.id, t.ids.disabled));
  });

  it('shows members their own keys and managers everyone’s', async () => {
    const mine = await t.member().apiKeys.create({ name: 'Mine', lifetimeDays: 90 });
    const owners = await t.owner().apiKeys.create({ name: 'Owner’s', lifetimeDays: 365 });

    const seen = (await t.member().apiKeys.list()).data.map((key) => key.id);

    expect(seen).toContain(mine.apiKey.id);
    expect(seen).not.toContain(owners.apiKey.id);

    const all = await t.owner().apiKeys.list();

    expect(all.data.map((key) => key.id)).toEqual(
      expect.arrayContaining([mine.apiKey.id, owners.apiKey.id]),
    );
    expect(all.data.find((key) => key.id === mine.apiKey.id)?.memberEmail).toBe('member@acme.mn');

    await expect(t.member().apiKeys.remove({ id: owners.apiKey.id })).rejects.toMatchObject({
      status: 404,
    });

    // Another organisation sees none of them.
    expect((await t.other().apiKeys.list()).data).toEqual([]);
    await expect(t.other().apiKeys.remove({ id: mine.apiKey.id })).rejects.toMatchObject({
      status: 404,
    });

    // The owner may revoke the member's key.
    await t.owner().apiKeys.remove({ id: mine.apiKey.id });
    await t.owner().apiKeys.remove({ id: owners.apiKey.id });
  });

  it('caps a member at 20 keys', async () => {
    for (let index = 0; index < 20; index += 1) {
      await t.member().apiKeys.create({ name: `Key ${index}`, lifetimeDays: 30 });
    }

    await expect(
      t.member().apiKeys.create({ name: 'One too many', lifetimeDays: 30 }),
    ).rejects.toMatchObject({ status: 400, code: 'LIMIT_EXCEEDED' });
  });
});
