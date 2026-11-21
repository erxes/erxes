import { customObjectType, type CursorQuery } from '@erxes/core-contract';
import { caller, callerUserId, type Db, dataFields, newId } from '@erxes/core-db';
import { compileFilter, FilterParam, invalidFilter, textArray } from '@erxes/plugin-sdk/filter';
import { and, inArray, type SQL, sql } from 'drizzle-orm';
import { computedFor } from './computed';
import { notFound } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { columnParam, searchQuery, searchText } from './codec';
import { objectTable } from './columns';
import { activeObject, alias, type DataObjectRow, fieldsOf, qualified } from './definitions';
import { recordPage } from './recordPage';
import { filterFields, sortExpression, valueColumns, valuesOf } from './recordQueries';
import { relationSides, writeRelation } from './relationValues';
import { asTaken } from './unique';
import { prepareValues, type PreparedValues } from './values';

/** A custom object's records, in its own table (`obj_<key>`). */

const T = alias('t');

/** Everything a read of an object's records needs. */
const recordSource = async (client: Db, objectKey: string) => {
  const object = await activeObject(client, objectKey);
  const recordType = customObjectType(object.key);
  const fields = await fieldsOf(client, recordType);
  const sides = await relationSides(client, fields);
  const table = objectTable(object.key);
  const { values: computed } = await computedFor(client, recordType, fields, T, sql`${T}.id`);

  return {
    object,
    fields,
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
      ...valueColumns(fields, sides, T, sql`${T}.id`, computed),
    ],
  };
};

type Source = Awaited<ReturnType<typeof recordSource>>;

/** What names a record: its label field's value, as text. */
const labelOf = (object: DataObjectRow, source: Source, values: Record<string, unknown>) => {
  const field = source.fields.find((row) => row.id === object.labelFieldId);
  const value = field ? values[field.key] : null;

  if (typeof value === 'string') return value;

  if (value && typeof value === 'object' && 'firstName' in value) {
    return Object.values(value).filter(Boolean).join(' ') || null;
  }

  return null;
};

const recordOut = (source: Source, row: Record<string, unknown>) => {
  const values = valuesOf(source.fields, source.sides, row);

  return {
    id: String(row.id),
    recordType: customObjectType(source.object.key),
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

/** A timestamptz the driver read: a Date already, or its text. */
const asDate = (value: unknown) => (value instanceof Date ? value : new Date(String(value)));

const readRecord = async (client: Db, source: Source, id: string, where?: SQL) => {
  const { rows } = await client.execute(
    sql`select ${T}.id, ${sql.join(source.columns, sql`, `)} from ${source.from} where ${and(sql`${T}.id = ${id}`, where)}`,
  );

  const [row] = rows;

  if (!row) throw notFound('Record');

  return recordOut(source, row);
};

const filterOf = (source: Source, filter: string | undefined) => {
  if (!filter) return undefined;

  const parsed = FilterParam.safeParse(filter);

  if (!parsed.success) throw invalidFilter('The filter is not a condition group');

  const who = caller();

  const fields = filterFields(source.fields, source.sides, T, sql`${T}.id`, source.computed);

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
  const sort = sortExpression(source.fields, T, input.sortField, source.computed);

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

const assignments = (prepared: PreparedValues) =>
  prepared.own.map(({ column, value }) => ({
    name: sql.identifier(column.name),
    value: columnParam(column, value),
  }));

/** The search text from every value the record holds after this write. */
const searchOf = (source: Source, values: Record<string, unknown>) =>
  sql`to_tsvector('simple', ${searchText(source.fields, values)})`;

/**
 * Each auto number's next value for a new record. Holding the field's row until the write
 * commits keeps two records from taking the same number.
 */
const nextNumbers = async (client: Db, source: Source) => {
  const numbered = source.fields.filter((field) => field.type === 'autoNumber' && field.column);

  if (!numbered.length) return [];

  await client
    .select({ id: dataFields.id })
    .from(dataFields)
    .where(
      inArray(
        dataFields.id,
        numbered.map((field) => field.id),
      ),
    )
    .for('update');

  return numbered.map((field) => {
    const column = sql.identifier(field.column ?? '');

    return {
      name: column,
      value: sql`(select coalesce(max(${column}), 0) + 1 from ${qualified(source.table)})`,
    };
  });
};

const writeOutside = (client: Db, prepared: PreparedValues, id: string) =>
  inOrder(prepared.outside, ({ side, value }) => writeRelation(client, side, id, value));

export const createRecord = async (
  client: Db,
  input: { objectKey: string; values: Record<string, unknown>; position?: number },
) => {
  const source = await recordSource(client, input.objectKey);
  const prepared = await prepareValues(client, source.fields, source.sides, input.values, true);
  const id = newId();
  const set = [...assignments(prepared), ...(await nextNumbers(client, source))];

  const columns = [
    sql`id`,
    sql`position`,
    sql`search`,
    sql`created_by`,
    sql`updated_by`,
    ...set.map((item) => item.name),
  ];

  const position = input.position ?? sql`extract(epoch from now())`;

  const values = [
    sql`${id}`,
    sql`${position}`,
    searchOf(source, prepared.values),
    sql`${callerUserId()}`,
    sql`${callerUserId()}`,
    ...set.map((item) => item.value),
  ];

  await asTaken(source.table, source.fields, () =>
    client.execute(
      sql`insert into ${qualified(source.table)} (${sql.join(columns, sql`, `)}) values (${sql.join(values, sql`, `)})`,
    ),
  );
  await writeOutside(client, prepared, id);

  return readRecord(client, source, id);
};

export const updateRecord = async (
  client: Db,
  input: { objectKey: string; id: string; values: Record<string, unknown>; position?: number },
) => {
  const source = await recordSource(client, input.objectKey);
  const current = await readRecord(client, source, input.id, sql`${T}.deleted_at is null`);
  const prepared = await prepareValues(client, source.fields, source.sides, input.values, false);

  const set = [
    ...assignments(prepared),
    { name: sql`search`, value: searchOf(source, { ...current.values, ...prepared.values }) },
    { name: sql`updated_by`, value: sql`${callerUserId()}` },
    { name: sql`updated_at`, value: sql`now()` },
    ...(input.position === undefined
      ? []
      : [{ name: sql`position`, value: sql`${input.position}` }]),
  ];

  await asTaken(source.table, source.fields, () =>
    client.execute(
      sql`update ${qualified(source.table)} set ${sql.join(
        set.map((item) => sql`${item.name} = ${item.value}`),
        sql`, `,
      )} where id = ${input.id}`,
    ),
  );
  await writeOutside(client, prepared, input.id);

  return readRecord(client, source, input.id);
};

/** Moves a record to the recycle bin (`deleted`) or back out of it. */
export const setRecordDeleted = async (
  client: Db,
  objectKey: string,
  id: string,
  deleted: boolean,
) => {
  const source = await recordSource(client, objectKey);

  await readRecord(
    client,
    source,
    id,
    deleted ? sql`${T}.deleted_at is null` : sql`${T}.deleted_at is not null`,
  );
  await asTaken(source.table, source.fields, () =>
    client.execute(
      sql`update ${qualified(source.table)} set deleted_at = ${deleted ? sql`now()` : sql`null`}, updated_by = ${callerUserId()}, updated_at = now() where id = ${id}`,
    ),
  );

  return readRecord(client, source, id);
};
