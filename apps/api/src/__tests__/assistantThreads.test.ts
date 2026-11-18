import { assistantThreads, newId, schema } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { follow } from './assistantChat';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const at = (minutes: number) => new Date(Date.now() - minutes * 60_000);

const notFound = { status: 404, code: 'NOT_FOUND' };

describe('assistant threads', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const ids = { owner: newId(), ownerOld: newId(), member: newId(), other: newId() };

  beforeAll(async () => {
    await adminDb()
      .insert(assistantThreads)
      .values([
        {
          id: ids.ownerOld,
          orgId: t.ids.org,
          userId: t.ids.owner,
          title: 'Old',
          updatedAt: at(10),
        },
        { id: ids.owner, orgId: t.ids.org, userId: t.ids.owner, title: 'Sales', updatedAt: at(1) },
        { id: ids.member, orgId: t.ids.org, userId: t.ids.member, title: 'Mine' },
        { id: ids.other, orgId: t.ids.otherOrg, userId: t.ids.otherOwner, title: 'Globex' },
      ]);
  });

  it('shows members only their own threads, most recently active first', async () => {
    const owner = await t.owner().assistant.threads({});

    expect(owner.data.map((row) => row.title)).toEqual(['Sales', 'Old']);
    expect(owner.data[0]).toMatchObject({ id: ids.owner, title: 'Sales', pinned: false });
    expect(Object.keys(owner.data[0] ?? {}).toSorted()).toEqual([
      'createdAt',
      'id',
      'pinned',
      'title',
      'updatedAt',
    ]);
    expect((await t.member().assistant.threads({})).data.map((row) => row.id)).toEqual([
      ids.member,
    ]);
    expect((await t.other().assistant.threads({})).data.map((row) => row.id)).toEqual([ids.other]);

    const page = await t.owner().assistant.threads({ limit: 1 });

    expect(page.data.map((row) => row.id)).toEqual([ids.owner]);
    expect(page.pageInfo.hasNextPage).toBe(true);
  });

  it('opens a thread and follows its conversation, empty before the first message', async () => {
    await expect(t.owner().assistant.thread({ id: ids.owner })).resolves.toMatchObject({
      id: ids.owner,
      title: 'Sales',
      pinned: false,
    });

    const view = await follow(t.owner(), ids.owner, () => true);

    expect(view.entries.filter((entry) => entry.kind === 'assistant.user')).toEqual([]);
  });

  it("hides another member's and another organisation's threads", async () => {
    await expect(t.member().assistant.thread({ id: ids.owner })).rejects.toMatchObject(notFound);
    await expect(t.other().assistant.thread({ id: ids.owner })).rejects.toMatchObject(notFound);
    await expect(
      t.member().assistant.updateThread({ id: ids.owner, title: 'Taken' }),
    ).rejects.toMatchObject(notFound);
    await expect(t.other().assistant.removeThread({ id: ids.owner })).rejects.toMatchObject(
      notFound,
    );
    await expect(t.member().assistant.stopThread({ id: ids.owner })).rejects.toMatchObject(
      notFound,
    );
    await expect(follow(t.other(), ids.owner)).rejects.toMatchObject(notFound);

    expect((await t.owner().assistant.thread({ id: ids.owner })).title).toBe('Sales');
  });

  it('renames, pins and filters pinned threads', async () => {
    const renamed = await t.owner().assistant.updateThread({
      id: ids.ownerOld,
      title: 'Q3 review',
      pinned: true,
    });

    expect(renamed).toMatchObject({ title: 'Q3 review', pinned: true });
    expect((await t.owner().assistant.threads({ pinned: true })).data.map((row) => row.id)).toEqual(
      [ids.ownerOld],
    );
  });

  it('deletes a thread with its conversation, so it can no longer be opened or followed', async () => {
    const stored = () =>
      adminDb()
        .select({ id: schema.agentConversations.id })
        .from(schema.agentConversations)
        .where(eq(schema.agentConversations.storageKey, `assistant:${ids.owner}`));

    await follow(t.owner(), ids.owner, () => true);
    expect(await stored()).not.toEqual([]);

    await t.owner().assistant.removeThread({ id: ids.owner });

    expect(await stored()).toEqual([]);
    await expect(t.owner().assistant.thread({ id: ids.owner })).rejects.toMatchObject(notFound);
    await expect(follow(t.owner(), ids.owner)).rejects.toMatchObject(notFound);
    expect((await t.owner().assistant.threads({})).data.map((row) => row.id)).toEqual([
      ids.ownerOld,
    ]);
  });
});
