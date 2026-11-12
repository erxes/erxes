import {
  companies,
  companyTags,
  type ContentType,
  customers,
  customerTags,
  type Db,
} from '@erxes/core-db';
import { and, eq, inArray, notInArray, type SQL, sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

/** The link table and record table of each taggable type. */
const LINKS = {
  customer: { links: customerTags, records: customers },
  company: { links: companyTags, records: companies },
} as const;

/** A record's tag ids (in the order they were added), as a select column. */
export const tagIdsColumn = (type: ContentType, recordId: PgColumn) => {
  const { links } = LINKS[type];

  return sql<string[]>`coalesce((
    select array_agg(${links.tagId} order by ${links.createdAt}, ${links.tagId})
    from ${links} where ${links.recordId} = ${recordId}
  ), '{}'::text[])`.as('tag_ids');
};

/** Records with any of `tagIds` (for list filters). */
export const hasAnyTag = (type: ContentType, recordId: PgColumn, tagIds: string[]): SQL => {
  const { links } = LINKS[type];

  return sql`exists (select 1 from ${links} where ${links.recordId} = ${recordId} and ${inArray(links.tagId, tagIds)})`;
};

/** Makes a record's tags exactly `tagIds` (already checked by `checkTagIds`). */
export const setRecordTags = async (
  client: Db,
  orgId: string,
  type: ContentType,
  recordId: string,
  tagIds: string[],
) => {
  const { links } = LINKS[type];

  await client
    .delete(links)
    .where(
      and(
        eq(links.orgId, orgId),
        eq(links.recordId, recordId),
        tagIds.length ? notInArray(links.tagId, tagIds) : undefined,
      ),
    );

  if (tagIds.length) {
    await client
      .insert(links)
      .values(tagIds.map((tagId) => ({ orgId, recordId, tagId })))
      .onConflictDoNothing();
  }
};

/**
 * Adds and removes tags on many records; ids outside the organisation are
 * ignored. Returns how many records were in scope.
 */
export const changeTags = async (
  client: Db,
  orgId: string,
  type: ContentType,
  recordIds: string[],
  change: { add: string[]; remove: string[] },
) => {
  const { links, records } = LINKS[type];

  const inScope = await client
    .select({ id: records.id })
    .from(records)
    .where(and(eq(records.orgId, orgId), inArray(records.id, recordIds)));

  const ids = inScope.map((record) => record.id);

  if (!ids.length) {
    return 0;
  }

  if (change.remove.length) {
    await client
      .delete(links)
      .where(
        and(
          eq(links.orgId, orgId),
          inArray(links.recordId, ids),
          inArray(links.tagId, change.remove),
        ),
      );
  }

  if (change.add.length) {
    await client
      .insert(links)
      .values(ids.flatMap((recordId) => change.add.map((tagId) => ({ orgId, recordId, tagId }))))
      .onConflictDoNothing();
  }

  return ids.length;
};

/** Gives `toId` every tag of `fromIds` (merge, before the others are deleted). */
export const copyTags = async (
  client: Db,
  orgId: string,
  type: ContentType,
  fromIds: string[],
  toId: string,
) => {
  const { links } = LINKS[type];

  await client.execute(sql`
    insert into ${links} (org_id, ${sql.raw(type === 'customer' ? 'customer_id' : 'company_id')}, tag_id, created_at)
    select org_id, ${toId}, tag_id, created_at from ${links}
    where ${eq(links.orgId, orgId)} and ${inArray(links.recordId, fromIds)}
    on conflict do nothing
  `);
};
