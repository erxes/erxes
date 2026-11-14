import { activities, customers, newId, users } from '@erxes/core-db';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { HR_SECRET } from './plugin';
import { useTwoOrgs } from './support';

describe('recycle bin and mass-deletion guard', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const adminId = newId();
  const admin = () => t.client({ user: adminId, org: t.ids.org });

  beforeAll(async () => {
    await adminDb().insert(users).values({
      id: adminId,
      orgId: t.ids.org,
      email: 'a@acme.mn',
      role: 'admin',
      status: 'active',
    });
  });

  it('keeps deleted customers with their tags, links and timeline, and restores them whole', async () => {
    const owner = t.owner();
    const tag = await owner.tags.create({ type: 'customer', name: 'vip', colorCode: '#ff0000' });
    const company = await owner.companies.create({ primaryName: 'Acme LLC' });

    const { id } = await owner.customers.create({
      firstName: 'Saraa',
      primaryEmail: 'saraa@mail.mn',
      tagIds: [tag.id],
    });

    await owner.customers.linkCompany({ id, companyId: company.id });
    await owner.activities.addNote({ targetType: 'customer', targetId: id, body: 'Remember me' });

    expect(await admin().customers.remove({ ids: [id] })).toEqual({ removed: 1 });
    await expect(owner.customers.get({ id })).rejects.toMatchObject({ status: 404 });

    const [binned] = (await admin().trash.list({})).data;

    expect(binned).toMatchObject({
      recordType: 'customer',
      recordId: id,
      label: 'Saraa',
      counts: { tags: 1, links: 1 },
    });
    expect(binned?.counts.activities).toBeGreaterThanOrEqual(2);
    expect(await admin().trash.restore({ ids: [binned?.id ?? ''] })).toEqual({
      restored: 1,
      failed: [],
    });

    const back = await owner.customers.get({ id });

    expect(back).toMatchObject({ firstName: 'Saraa', primaryEmail: 'saraa@mail.mn' });
    expect(back.tagIds).toContain(tag.id);
    expect((await owner.customers.companies({ id })).data.map((item) => item.id)).toContain(
      company.id,
    );

    const notes = await owner.activities.list({
      targetType: 'customer',
      targetId: id,
      kind: 'notes',
    });

    expect(notes.data.map((item) => item.note?.body)).toContain('Remember me');
    expect((await admin().trash.list({})).data).toEqual([]);

    // Purging for good is the owner's.
    await admin().customers.remove({ ids: [id] });

    const ids = (await admin().trash.list({})).data.map((item) => item.id);

    await expect(admin().trash.purge({ ids })).rejects.toMatchObject({ status: 403 });
    expect(await owner.trash.purge({ ids })).toEqual({ purged: 1 });
  });

  it('stops a member deleting far too much at once, tells the owners, and keeps everything restorable', async () => {
    const ids = Array.from({ length: 45 }, () => newId());

    await adminDb()
      .insert(customers)
      .values(ids.map((id, index) => ({ id, orgId: t.ids.org, firstName: `Bulk ${index}` })));

    expect(await admin().customers.remove({ ids: ids.slice(0, 25) })).toEqual({ removed: 25 });
    await expect(admin().customers.remove({ ids: ids.slice(25) })).rejects.toMatchObject({
      status: 429,
      code: 'MASS_DELETE_STOPPED',
    });
    // Refused: nothing of the second batch was deleted.
    expect((await t.owner().customers.get({ id: ids[30] ?? '' })).id).toBe(ids[30]);

    const alerts = await t.owner().notifications.list({ kind: 'core.security.mass_deletion' });

    expect(alerts.data.length).toBeGreaterThanOrEqual(1);
    // Owners are not limited.
    expect(await t.owner().customers.remove({ ids: ids.slice(25) })).toEqual({ removed: 20 });
    expect((await t.owner().trash.list({ limit: 500 })).data).toHaveLength(45);
  });

  it('suspends a plugin that deletes far too much', async () => {
    const hr = t.client(await t.pluginToken(HR_SECRET, t.ids.org));
    const customer = await t.owner().customers.create({ firstName: 'Target' });
    const entries = Array.from({ length: 45 }, () => newId());

    await adminDb()
      .insert(activities)
      .values(
        entries.map((id) => ({
          id,
          orgId: t.ids.org,
          targetType: 'customer',
          targetId: customer.id,
          source: 'hr',
          type: 'hr.x.y',
          summary: 'x',
          actorType: 'plugin' as const,
          actorId: 'hr',
        })),
      );

    const removeAll = async () => {
      for (const id of entries) await hr.activities.remove({ id });
    };

    await expect(removeAll()).rejects.toMatchObject({ code: 'MASS_DELETE_STOPPED' });

    const state = (await t.owner().plugins.list({})).data.find((plugin) => plugin.name === 'hr');

    expect(state?.installation?.status).toBe('disabled');
    expect(state?.installation?.statusReason).toMatch(/Suspended/);
    // Its tokens stop working; installing again resumes it.
    await expect(hr.activities.remove({ id: entries[44] ?? '' })).rejects.toMatchObject({
      status: 401,
    });
    expect(await t.owner().plugins.install({ name: 'hr' })).toMatchObject({
      installation: { status: 'active', statusReason: null },
    });
  });
});
