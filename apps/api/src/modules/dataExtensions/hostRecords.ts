import {
  companies,
  customers,
  type Db,
  dataFields,
  dataTables,
  products,
  trash,
  withOrg,
} from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { and, eq, type SQL, sql } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { assertRecordRight, findRecordType } from '~/modules/recordTypes/recordTypes.service';
import { columnsOf, holdsLink, linkColumn } from './columns';
import { fieldsOf, qualified, tableOf } from './definitions';
import { removeHistory, removeOrphanHistory } from './valueHistory';

/**
 * Values on core's and plugins' records once the record is gone: a plugin says so, core's
 * merged records hand theirs to the one kept, and core's records deleted for good (out of the
 * recycle bin) are swept up hourly. Their links from other records go with them.
 */

/** Which record ids a cleanup is about, as a test on an id column. */
type Gone = (id: SQL) => SQL;

const byIds =
  (ids: string[]): Gone =>
  (id) =>
    sql`${id} = any(${textArray(ids)})`;

/** Relation fields, of any record type, that link to `recordType`'s records. */
const linksTo = (client: Db, recordType: string) =>
  client
    .select()
    .from(dataFields)
    .where(
      and(
        eq(dataFields.type, 'relation'),
        sql`${dataFields.relation} ->> 'targetRecordType' = ${recordType}`,
      ),
    );

/** A pairs table's column of the linked records, and the one of the linking side. */
const pairColumns = (side: 'source' | 'inverse') =>
  side === 'source'
    ? { theirs: sql`target_id`, mine: sql`source_id` }
    : { theirs: sql`source_id`, mine: sql`target_id` };

/**
 * Runs `pairs` for each many-to-many to `recordType`, and `column` for each link column that
 * holds its records' ids.
 */
const eachLink = async (
  client: Db,
  recordType: string,
  pairs: (table: SQL, columns: ReturnType<typeof pairColumns>) => Promise<unknown>,
  column: (table: SQL, link: SQL) => Promise<unknown>,
) => {
  const fields = await linksTo(client, recordType);

  await inOrder(fields, async ({ relation, column: name, recordType: from }) => {
    if (!relation) return;

    if (relation.pairsTable) {
      await pairs(qualified(relation.pairsTable), pairColumns(relation.side));

      return;
    }

    const table = holdsLink(relation) && name ? await tableOf(client, from) : null;

    if (table && name) await column(qualified(table), sql`${sql.identifier(linkColumn(name))}`);
  });
};

const clearLinks = (client: Db, recordType: string, gone: Gone) =>
  eachLink(
    client,
    recordType,
    (table, { theirs }) => client.execute(sql`delete from ${table} where ${gone(theirs)}`),
    (table, link) => client.execute(sql`update ${table} set ${link} = null where ${gone(link)}`),
  );

const removeRows = async (client: Db, recordType: string, gone: Gone) => {
  const table = await tableOf(client, recordType);

  if (!table) return 0;

  const result = await client.execute(
    sql`delete from ${qualified(table)} where ${gone(sql`record_id`)}`,
  );

  return result.rowCount ?? 0;
};

/**
 * A plugin's records are gone: their values, links and value history go too. 400
 * INVALID_REFERENCE for a type that isn't a plugin's; 403 unless the caller is its plugin.
 */
export const removePluginValues = async (
  client: Db,
  input: { recordType: string; recordIds: string[] },
) => {
  const recordType = await findRecordType(client, input.recordType);

  if (!recordType.plugin) {
    throw fail('INVALID_REFERENCE', 'Only a plugin’s records are removed this way', {
      field: 'recordType',
    });
  }

  assertRecordRight(recordType, 'update');

  const gone = byIds(input.recordIds);
  const removed = await removeRows(client, input.recordType, gone);

  await clearLinks(client, input.recordType, gone);
  await removeHistory(client, input.recordType, input.recordIds);

  return { removed };
};

/**
 * Merged records: the kept one keeps its values, and each one it lacks comes from the first of
 * the others that has it (in `otherIds`' order); links to the others now point to it.
 */
export const mergeHostValues = async (
  client: Db,
  recordType: string,
  keepId: string,
  otherIds: string[],
) => {
  if (!otherIds.length) return;

  const table = await tableOf(client, recordType);

  if (table) {
    const t = qualified(table);
    const others = textArray(otherIds);
    const columns = (await fieldsOf(client, recordType)).flatMap(columnsOf);

    await client.execute(
      sql`insert into ${t} (record_id) values (${keepId}) on conflict do nothing`,
    );

    const filled = columns.map(({ name }) => {
      const column = sql.identifier(name);

      return sql`${column} = coalesce(${t}.${column}, (select g.${column} from gone g where g.${column} is not null order by array_position(${others}, g.record_id) limit 1))`;
    });

    // The others' rows go first, so a unique value can move to the kept record.
    await client.execute(
      filled.length
        ? sql`with gone as (delete from ${t} where record_id = any(${others}) returning *)
            update ${t} set ${sql.join(filled, sql`, `)} where record_id = ${keepId}`
        : sql`delete from ${t} where record_id = any(${others})`,
    );
  }

  await eachLink(
    client,
    recordType,
    async (pairs, { mine, theirs }) => {
      await client.execute(
        sql`insert into ${pairs} (${mine}, ${theirs}) select ${mine}, ${keepId} from ${pairs} where ${theirs} = any(${textArray(otherIds)}) on conflict do nothing`,
      );
      await client.execute(sql`delete from ${pairs} where ${theirs} = any(${textArray(otherIds)})`);
    },
    (other, link) =>
      client.execute(
        sql`update ${other} set ${link} = ${keepId} where ${link} = any(${textArray(otherIds)})`,
      ),
  );
};

/** Core's record types, the table their records are in, and their recycle bin's type. */
const CORE_RECORDS: Record<string, { table: PgTable; id: PgColumn; binned: string | null }> = {
  'core.customer': { table: customers, id: customers.id, binned: 'customer' },
  'core.company': { table: companies, id: companies.id, binned: 'company' },
  'core.product': { table: products, id: products.id, binned: null },
};

/** Core records deleted for good: not in their table, nor in the recycle bin. */
const goneFromCore =
  ({ table, id, binned }: (typeof CORE_RECORDS)[string]): Gone =>
  (recordId) =>
    sql`not exists (select 1 from ${table} where ${id} = ${recordId})${
      binned
        ? sql` and not exists (select 1 from ${trash} where ${trash.recordType} = ${binned} and ${trash.recordId} = ${recordId})`
        : sql``
    }`;

/**
 * Housekeeping (system scope), each organisation that uses Data Extensions: values and links
 * of core records deleted for good, and the value history of custom records purged.
 */
export const sweepRemovedRecords = async (client: Db) => {
  const tables = await client
    .select({ orgId: dataTables.orgId, recordType: dataTables.recordType, kind: dataTables.kind })
    .from(dataTables);

  const orgs = [...new Set(tables.map((table) => table.orgId))];

  await inOrder(orgs, (orgId) =>
    withOrg(orgId, async (tx) => {
      await inOrder(Object.entries(CORE_RECORDS), async ([recordType, core]) => {
        await removeRows(tx, recordType, goneFromCore(core));
        await clearLinks(tx, recordType, goneFromCore(core));
      });

      const objects = tables.filter((table) => table.orgId === orgId && table.kind === 'object');

      await inOrder(objects, ({ recordType }) => removeOrphanHistory(tx, recordType));
    }),
  );
};
