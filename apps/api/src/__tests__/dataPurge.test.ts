import { dataTables } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { purgeDeletedRecords } from '~/modules/dataExtensions/recycleBin';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('Data Extensions: the recycle bin empties itself', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** Two binned projects in an organisation: one binned 31 days ago, one today. */
  const binTwo = async (client: ReturnType<typeof t.owner>, orgId: string) => {
    await client.dataObjects.create({
      key: 'project',
      singularLabel: 'Project',
      pluralLabel: 'Projects',
    });

    const old = await client.dataRecords.create({ objectKey: 'project', values: { name: 'Old' } });

    const recent = await client.dataRecords.create({
      objectKey: 'project',
      values: { name: 'Recent' },
    });

    await client.dataRecords.remove({ objectKey: 'project', id: old.id });
    await client.dataRecords.remove({ objectKey: 'project', id: recent.id });

    const [table] = await adminDb()
      .select({ name: dataTables.tableName })
      .from(dataTables)
      .where(eq(dataTables.orgId, orgId));

    await adminDb().execute(
      sql`update ${sql.identifier(`data_${orgId}`)}.${sql.identifier(table?.name ?? '')}
        set deleted_at = now() - interval '31 days' where id = ${old.id}`,
    );

    return recent.id;
  };

  it('deletes every organisation’s records binned 30 days ago, and keeps the rest', async () => {
    const acme = await binTwo(t.owner(), t.ids.org);
    const globex = await binTwo(t.other(), t.ids.otherOrg);

    expect(await purgeDeletedRecords()).toBe(2);

    const left = async (client: ReturnType<typeof t.owner>) =>
      (await client.dataRecords.list({ objectKey: 'project', deleted: true })).data.map(
        (row) => row.id,
      );

    expect(await left(t.owner())).toEqual([acme]);
    expect(await left(t.other())).toEqual([globex]);
    // Nothing more to do on the next run.
    expect(await purgeDeletedRecords()).toBe(0);
  });
});
