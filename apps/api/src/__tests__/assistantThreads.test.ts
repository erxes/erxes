import { assistantMessages, assistantThreads, newId } from '@erxes/core-db';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const at = (minutes: number) => new Date(Date.now() - minutes * 60_000);

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
    await adminDb()
      .insert(assistantMessages)
      .values([
        {
          threadId: ids.owner,
          id: 'm1',
          orgId: t.ids.org,
          role: 'user',
          parts: [{ type: 'text', text: 'How are sales?' }],
          position: 0,
        },
        {
          threadId: ids.owner,
          id: 'm2',
          orgId: t.ids.org,
          role: 'assistant',
          parts: [{ type: 'text', text: 'Up 4%.' }],
          position: 1,
        },
      ]);
  });

  it('shows members only their own threads, most recently active first', async () => {
    const owner = await t.owner().assistant.threads({});

    expect(owner.data.map((row) => row.title)).toEqual(['Sales', 'Old']);
    expect(owner.data[0]).toMatchObject({ pinned: false, running: false });
    expect((await t.member().assistant.threads({})).data.map((row) => row.id)).toEqual([
      ids.member,
    ]);
    expect((await t.other().assistant.threads({})).data.map((row) => row.id)).toEqual([ids.other]);

    const page = await t.owner().assistant.threads({ limit: 1 });

    expect(page.data.map((row) => row.id)).toEqual([ids.owner]);
    expect(page.pageInfo.hasNextPage).toBe(true);
  });

  it('opens a thread with its messages in order', async () => {
    const thread = await t.owner().assistant.thread({ id: ids.owner });

    expect(thread.messages.map((row) => [row.role, row.parts])).toEqual([
      ['user', [{ type: 'text', text: 'How are sales?' }]],
      ['assistant', [{ type: 'text', text: 'Up 4%.' }]],
    ]);
  });

  it("hides another member's and another organisation's threads", async () => {
    const notFound = { status: 404, code: 'NOT_FOUND' };

    await expect(t.member().assistant.thread({ id: ids.owner })).rejects.toMatchObject(notFound);
    await expect(t.other().assistant.thread({ id: ids.owner })).rejects.toMatchObject(notFound);
    await expect(
      t.member().assistant.updateThread({ id: ids.owner, title: 'Taken' }),
    ).rejects.toMatchObject(notFound);
    await expect(t.other().assistant.removeThread({ id: ids.owner })).rejects.toMatchObject(
      notFound,
    );

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

  it('deletes a thread with its messages', async () => {
    await t.owner().assistant.removeThread({ id: ids.owner });

    await expect(t.owner().assistant.thread({ id: ids.owner })).rejects.toMatchObject({
      status: 404,
    });
    expect(await adminDb().select().from(assistantMessages)).toEqual([]);
  });
});
