import { companies, customers, type Db, products, users } from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { inArray, sql } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { fail } from '~/http/errors';
import { customKeyOf, qualified, tableOf } from './definitions';

/** Core's record types a relation or member field can point to, and where their ids are. */
const CORE_TABLES: Record<string, { table: PgTable; id: PgColumn }> = {
  'core.customer': { table: customers, id: customers.id },
  'core.company': { table: companies, id: companies.id },
  'core.product': { table: products, id: products.id },
  'core.member': { table: users, id: users.id },
};

const existing = async (client: Db, recordType: string, ids: string[]) => {
  const core = CORE_TABLES[recordType];

  if (core) {
    const rows = await client.select({ id: core.id }).from(core.table).where(inArray(core.id, ids));

    return rows.map((row) => String(row.id));
  }

  const table = customKeyOf(recordType) ? await tableOf(client, recordType) : null;

  if (!table) return null;

  const { rows } = await client.execute<{ id: string }>(
    sql`select id from ${qualified(table)} where id = any(${textArray(ids)}) and deleted_at is null`,
  );

  return rows.map((row) => row.id);
};

/**
 * Throws 400 INVALID_REFERENCE (naming the input `field`) unless every id is a record of
 * `recordType`: core's or a custom object's in use. A plugin's records live in the plugin, so
 * its ids are taken as given.
 */
export const assertRecordsExist = async (
  client: Db,
  recordType: string,
  ids: string[],
  field: string,
) => {
  const wanted = [...new Set(ids)];

  if (!wanted.length) return;

  const found = await existing(client, recordType, wanted);

  if (found === null) return;

  const known = new Set(found);
  const missing = wanted.filter((id) => !known.has(id));

  if (missing.length) {
    throw fail('INVALID_REFERENCE', `${missing.join(', ')} is not a ${recordType} record`, {
      field,
    });
  }
};
