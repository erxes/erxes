import { CUSTOM_OBJECT_PREFIX, customObjectType } from '@erxes/core-contract';
import { type Db, dataFields, dataObjects, dataTables, requestOrgId } from '@erxes/core-db';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { hostTable, objectTable, schemaOf } from './columns';
import { createTable } from './ddl';

/** The definitions Data Extensions reads: objects, fields, and where each record type is kept. */

export type DataObjectRow = typeof dataObjects.$inferSelect;

export type DataFieldRow = typeof dataFields.$inferSelect;

/** Most custom objects an organisation has, and fields a record type has. */
export const OBJECTS_MAX = 50;
export const FIELDS_MAX = 100;

/** The object's key when `recordType` is a custom object's (`custom.project` → `project`). */
export const customKeyOf = (recordType: string) =>
  recordType.startsWith(`${CUSTOM_OBJECT_PREFIX}.`)
    ? recordType.slice(CUSTOM_OBJECT_PREFIX.length + 1)
    : null;

/** An object as the API answers: its row and its record type. */
export const objectOut = (row: DataObjectRow) => ({
  ...row,
  recordType: customObjectType(row.key),
});

export const findObject = async (client: Db, key: string) => {
  const [row] = await client.select().from(dataObjects).where(eq(dataObjects.key, key)).limit(1);

  if (!row) throw notFound('Object');

  return row;
};

/** An object whose records may be read and written: 409 NOT_ACTIVE while it is archived. */
export const activeObject = async (client: Db, key: string) => {
  const row = await findObject(client, key);

  if (row.status !== 'active') throw fail('NOT_ACTIVE', `${row.pluralLabel} are archived`);

  return row;
};

export const findField = async (client: Db, id: string) => {
  const [row] = await client.select().from(dataFields).where(eq(dataFields.id, id)).limit(1);

  if (!row) throw notFound('Field');

  return row;
};

/** A record type's fields, in order: the active ones, or every one with `all`. */
export const fieldsOf = (client: Db, recordType: string, all = false) =>
  client
    .select()
    .from(dataFields)
    .where(
      and(eq(dataFields.recordType, recordType), all ? undefined : eq(dataFields.status, 'active')),
    )
    .orderBy(asc(dataFields.position), asc(dataFields.createdAt));

export const fieldsById = (client: Db, ids: string[]) =>
  ids.length ? client.select().from(dataFields).where(inArray(dataFields.id, ids)) : [];

/** A table alias in a query, as SQL. */
export const alias = (name: string) => sql`${sql.identifier(name)}`;

/** A table in the organisation's schema, quoted for SQL: `"data_<org>"."obj_project"`. */
export const qualified = (table: string) =>
  sql`${sql.identifier(schemaOf(requestOrgId()))}.${sql.identifier(table)}`;

/** Where a record type's values are kept, or null before its first field. */
export const tableOf = async (client: Db, recordType: string) => {
  const [row] = await client
    .select({ tableName: dataTables.tableName })
    .from(dataTables)
    .where(eq(dataTables.recordType, recordType))
    .limit(1);

  return row?.tableName ?? null;
};

/** A table name for a core or plugin record type that no other record type has. */
const freeHostTable = async (client: Db, recordType: string) => {
  const names = new Set(
    (await client.select({ tableName: dataTables.tableName }).from(dataTables)).map(
      (row) => row.tableName,
    ),
  );

  const free = (n: number): string => {
    const name = hostTable(recordType, n === 1 ? '' : `_${n}`);

    return names.has(name) ? free(n + 1) : name;
  };

  return free(1);
};

/**
 * The table a record type's fields add columns to. A custom object's is made with it; a core
 * or plugin type's is made with its first field.
 */
export const ensureTable = async (client: Db, recordType: string) => {
  const existing = await tableOf(client, recordType);

  if (existing) return existing;

  const key = customKeyOf(recordType);
  const tableName = key ? objectTable(key) : await freeHostTable(client, recordType);
  const kind = key ? 'object' : 'host';

  await createTable(client, tableName, kind);
  await client.insert(dataTables).values({ recordType, tableName, kind });

  return tableName;
};
