import { customObjectType, type CursorQuery } from '@erxes/core-contract';
import { caller, type Db } from '@erxes/core-db';
import { compileFilter, FilterParam, invalidFilter, textArray } from '@erxes/plugin-sdk/filter';
import { and, type SQL, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { searchQuery } from './codec';
import { objectTable } from './columns';
import { computedFor } from './computed';
import { activeObject, alias, type DataObjectRow, fieldsOf, qualified } from './definitions';
import { readableFields } from './fieldAccess';
import { recordPage } from './recordPage';
import { filterFields, sortExpression, valueColumns, valuesOf } from './recordQueries';
import { relationSides } from './relationValues';

/** A custom object's records, in its own table (`obj_<key>`). */

export const T = alias('t');

/**
 * Everything a read of an object's records needs. `fields` are all the active ones, which
 * writes check; `readable` those whose values the caller may read (every one with `everything`,
 * for the checks and history a write makes), which reads, filters and sorts use.
 */
export const recordSource = async (client: Db, objectKey: string, everything = false) => {
  const object = await activeObject(client, objectKey);
  const recordType = customObjectType(object.key);
  const fields = await fieldsOf(client, recordType);
  const sides = await relationSides(client, fields);
  const table = objectTable(object.key);
  const { values: computed, uses } = await computedFor(client, recordType, fields, T, sql`${T}.id`);
  const readable = everything ? fields : await readableFields(client, fields, uses);

  return {
    object,
    recordType,
    fields,
    readable,
    sides,
    table,
    computed,
    from: sql`${qualified(table)} ${T}`,
    columns: [
      sql`${T}.position`,
      sql`${T}.created_by`,
      sql`${T}.updated_by`,
      sql`${T}.created_at`,
      sql`${T}.updated_at`,
      sql`${T}.deleted_at`,
      ...valueColumns(readable, sides, T, sql`${T}.id`, computed),
    ],
  };
};

export type RecordSource = Awaited<ReturnType<typeof recordSource>>;

/** What names a record: its label field's value, as text (null when the caller can't see it). */
const labelOf = (object: DataObjectRow, source: RecordSource, values: Record<string, unknown>) => {
  const field = source.readable.find((row) => row.id === object.labelFieldId);
  const value = field ? values[field.key] : null;

  if (typeof value === 'string') return value;

  if (value && typeof value === 'object' && 'firstName' in value) {
    return Object.values(value).filter(Boolean).join(' ') || null;
  }

  return null;
};

/** A timestamptz the driver read: a Date already, or its text. */
const asDate = (value: unknown) => (value instanceof Date ? value : new Date(String(value)));

const recordOut = (source: RecordSource, row: Record<string, unknown>) => {
  const values = valuesOf(source.readable, source.sides, row);

  return {
    id: String(row.id),
    recordType: source.recordType,
    label: labelOf(source.object, source, values),
    position: Number(row.position),
    values,
    createdBy: typeof row.created_by === 'string' ? row.created_by : null,
    updatedBy: typeof row.updated_by === 'string' ? row.updated_by : null,
    createdAt: asDate(row.created_at),
    updatedAt: asDate(row.updated_at),
    deletedAt: row.deleted_at ? asDate(row.deleted_at) : null,
  };
};

export const readRecord = async (client: Db, source: RecordSource, id: string, where?: SQL) => {
  const { rows } = await client.execute(
    sql`select ${T}.id, ${sql.join(source.columns, sql`, `)} from ${source.from} where ${and(sql`${T}.id = ${id}`, where)}`,
  );

  const [row] = rows;

  if (!row) throw notFound('Record');

  return recordOut(source, row);
};

const filterOf = (source: RecordSource, filter: string | undefined) => {
  if (!filter) return undefined;

  const parsed = FilterParam.safeParse(filter);

  if (!parsed.success) throw invalidFilter('The filter is not a condition group');

  const who = caller();

  const fields = filterFields(source.readable, source.sides, T, sql`${T}.id`, source.computed);

  return compileFilter(fields, parsed.data, {
    me: who.type === 'user' ? who.userId : null,
  });
};

export const listRecords = async (
  client: Db,
  input: CursorQuery & {
    objectKey: string;
    search?: string;
    filter?: string;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    deleted?: boolean;
    ids?: string[];
  },
) => {
  const source = await recordSource(client, input.objectKey);
  const sort = sortExpression(source.readable, T, input.sortField, source.computed);

  if (!sort) throw invalidFilter(`Records can't be sorted by ${input.sortField}`);

  const query = input.search ? searchQuery(input.search) : null;

  const where = and(
    input.deleted ? sql`${T}.deleted_at is not null` : sql`${T}.deleted_at is null`,
    query ? sql`${T}.search @@ to_tsquery('simple', ${query})` : undefined,
    input.ids ? sql`${T}.id = any(${textArray(input.ids)})` : undefined,
    filterOf(source, input.filter),
  );

  const page = await recordPage(
    client,
    {
      from: source.from,
      table: T,
      sort,
      descending: input.sortDirection === 'desc',
      where,
      columns: source.columns,
    },
    input,
  );

  return { ...page, data: page.rows.map((row) => recordOut(source, row)) };
};

export const getRecord = async (client: Db, objectKey: string, id: string) =>
  readRecord(client, await recordSource(client, objectKey), id);
