import { activities } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** The customer and company timeline: core changes, plugin entries and notes. */
describe('activity timeline', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const timeline = (targetId: string) =>
    t.member().activities.list({ targetType: 'customer', targetId });

  it('records customer changes, tags, links and merges', async () => {
    const a = await t.owner().customers.create({ firstName: 'Anu', primaryEmail: 'anu@mail.mn' });

    const b = await t
      .owner()
      .customers.create({ firstName: 'Anu B', primaryEmail: 'anub@mail.mn' });

    const tag = await t.owner().tags.create({ type: 'customer', name: 'VIP' });
    const company = await t.owner().companies.create({ primaryName: 'Nomad LLC' });

    await t.owner().customers.update({ id: a.id, lastName: 'Bold', firstName: 'Anu' });
    await t.owner().customers.tag({ ids: [a.id], add: [tag.id], remove: [] });
    await t.owner().customers.linkCompany({ id: a.id, companyId: company.id });
    await t.owner().customers.update({ id: b.id, position: 'CEO' });

    const before = await timeline(a.id);

    expect(before.data.map((item) => item.type)).toEqual([
      'customer.company_linked',
      'customer.tagged',
      'customer.updated',
      'customer.created',
    ]);
    expect(before.data[2]?.data).toEqual({ changes: { lastName: [null, 'Bold'] } });
    expect(before.data[1]?.data).toEqual({ added: [tag.id], removed: [] });

    const companyTimeline = await t
      .member()
      .activities.list({ targetType: 'company', targetId: company.id });

    expect(companyTimeline.data[0]).toMatchObject({
      type: 'company.customer_linked',
      data: { customerId: a.id },
    });

    // Merging moves the other customer's timeline to the one kept.
    await t.owner().customers.merge({ ids: [a.id, b.id], keepId: a.id });

    const merged = await timeline(a.id);
    const types = merged.data.map((item) => item.type);

    expect(types[0]).toBe('customer.merged');
    expect(merged.data[0]?.data).toMatchObject({ mergedIds: [b.id] });
    expect(types.filter((type) => type === 'customer.created')).toHaveLength(2);

    // Deleting a customer deletes its timeline.
    await t.owner().customers.remove({ ids: [a.id] });
    expect(
      await adminDb().select().from(activities).where(eq(activities.targetId, a.id)),
    ).toHaveLength(0);
  });

  it('lets plugins add entries, retry-safe, to records of their organisation', async () => {
    const customer = await t
      .owner()
      .customers.create({ firstName: 'Guest', primaryEmail: 'guest@mail.mn' });

    const entry = {
      targetType: 'customer' as const,
      targetId: customer.id,
      type: 'hr.candidate.applied',
      summary: 'Applied for Accountant',
      entityType: 'application',
      entityId: 'app1',
      link: '/hr/applications/app1',
      actorUserId: t.ids.member,
    };

    const keyed = { ...entry, dedupeKey: 'application-app1' };
    const first = await t.hr().activities.create(keyed);
    const retry = await t.hr().activities.create(keyed);

    expect(first.created).toBe(true);
    expect(retry).toMatchObject({ created: false, activity: { id: first.activity.id } });
    expect(first.activity).toMatchObject({
      source: 'hr',
      actorType: 'user',
      actorId: t.ids.member,
    });

    await expect(t.hr().activities.create({ ...entry, type: 'ecom.x.y' })).rejects.toMatchObject({
      code: 'INVALID_TYPE',
    });
    await expect(t.hr(t.ids.otherOrg).activities.create(entry)).rejects.toMatchObject({
      status: 404,
    });
    await expect(t.member().activities.create(entry)).rejects.toMatchObject({ status: 403 });

    const fromHr = await t
      .owner()
      .activities.list({ targetType: 'customer', targetId: customer.id, source: 'hr' });

    expect(fromHr.data).toHaveLength(1);
    await expect(
      t.other().activities.list({ targetType: 'customer', targetId: customer.id }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('adds notes with mentions and files; only the author edits, anyone pins', async () => {
    const { id } = await t
      .owner()
      .customers.create({ firstName: 'Noted', primaryEmail: 'noted@mail.mn' });

    await expect(
      t.owner().activities.addNote({
        targetType: 'customer',
        targetId: id,
        body: 'x',
        fileIds: ['missing'],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_FILE' });

    const note = await t.owner().activities.addNote({
      targetType: 'customer',
      targetId: id,
      body: 'Call back on Monday @member',
      mentions: [t.ids.member],
    });

    expect(note).toMatchObject({
      type: 'customer.note',
      actorType: 'user',
      actorId: t.ids.owner,
      note: { body: 'Call back on Monday @member', mentions: [t.ids.member], pinnedAt: null },
    });

    const mention = await t.member().notifications.list({ kind: 'core.note.mentioned' });

    expect(mention.data[0]).toMatchObject({
      body: 'Call back on Monday @member',
      link: `/contacts/customers/${id}`,
    });

    await expect(
      t.member().activities.editNote({ id: note.id, body: 'mine now' }),
    ).rejects.toMatchObject({ code: 'NOT_AUTHOR' });

    const pinned = await t.member().activities.pinNote({ id: note.id, pinned: true });

    const edited = await t
      .owner()
      .activities.editNote({ id: note.id, body: 'Call back on Tuesday' });

    expect(pinned.note?.pinnedAt).not.toBeNull();
    expect(edited.note).toMatchObject({ body: 'Call back on Tuesday' });
    expect(edited.note?.pinnedAt).not.toBeNull();
    expect(edited.note?.editedAt).not.toBeNull();

    const list = (query: { kind?: 'notes' | 'changes'; pinned?: 'true' }) =>
      t.owner().activities.list({ targetType: 'customer', targetId: id, ...query });

    expect((await list({ kind: 'notes' })).data).toHaveLength(1);
    expect((await list({ kind: 'changes' })).data.map((entry) => entry.type)).toEqual([
      'customer.created',
    ]);
    expect((await list({ pinned: 'true' })).data).toHaveLength(1);

    await expect(t.member().activities.removeNote({ id: note.id })).rejects.toMatchObject({
      status: 403,
    });
    await t.owner().activities.removeNote({ id: note.id });
  });

  it('shows a company’s customers’ entries on its timeline when asked', async () => {
    const company = await t.owner().companies.create({ primaryName: 'Rollup LLC' });

    const customer = await t
      .owner()
      .customers.create({ firstName: 'Rolled', primaryEmail: 'rolled@mail.mn' });

    await t.owner().customers.linkCompany({ id: customer.id, companyId: company.id });
    await t.owner().activities.addNote({
      targetType: 'customer',
      targetId: customer.id,
      body: 'Prefers email',
    });

    const notes = (includeRelated: 'true' | 'false') =>
      t.owner().activities.list({
        targetType: 'company',
        targetId: company.id,
        kind: 'notes',
        includeRelated,
      });

    expect((await notes('false')).data).toHaveLength(0);
    expect((await notes('true')).data[0]).toMatchObject({
      targetType: 'customer',
      targetId: customer.id,
    });
  });
});
