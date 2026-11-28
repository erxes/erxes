import type { DataExtensionRecordCreate } from '@erxes/core-contract';
import { callerUserId, type Db, dataFields, newId } from '@erxes/core-db';
import { inArray, sql } from 'drizzle-orm';
import type { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import { columnParam, searchText } from './codec';
import { qualified } from './definitions';
import { fieldsRuled } from './fieldAccess';
import { readRecord, recordSource, type RecordSource, T } from './records.service';
import { writeRelation } from './relationValues';
import { asTaken } from './unique';
import { prepareValues, type PreparedValues } from './values';
import { afterWrite, type Asked, askedBy } from './writeRules';

/**
 * Writes to a custom object's records. Each reads the record with every field (the checks and
 * the history need them all) and answers with what the caller may see.
 */

const assignments = (prepared: PreparedValues) =>
  prepared.own.map(({ column, value }) => ({
    name: sql.identifier(column.name),
    value: columnParam(column, value),
  }));

/** The search text from the values everyone may see, so search can't find a hidden one. */
const searchOf = (source: RecordSource, values: Record<string, unknown>) =>
  sql`to_tsvector('simple', ${searchText(
    source.fields.filter((field) => !field.settings.visibleTo?.length),
    values,
  )})`;

/**
 * Each auto number's next value for a new record. Holding the field's row until the write
 * commits keeps two records from taking the same number.
 */
const nextNumbers = async (client: Db, source: RecordSource) => {
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

/** The record as the caller sees it, after a write read with every field. */
const answer = async (client: Db, source: RecordSource, id: string) =>
  readRecord(client, fieldsRuled() ? await recordSource(client, source.object.key) : source, id);

/** Checks the written record and records the change. */
const finish = async (
  client: Db,
  source: RecordSource,
  id: string,
  before: Record<string, unknown> | null,
  asked: Asked,
) => {
  const after = await readRecord(client, source, id);

  await afterWrite(client, {
    recordType: source.recordType,
    recordId: id,
    fields: source.fields,
    before,
    after: after.values,
    asked,
  });

  return answer(client, source, id);
};

export const createRecord = async (
  client: Db,
  input: z.infer<typeof DataExtensionRecordCreate>,
) => {
  const source = await recordSource(client, input.objectKey, true);
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

  return finish(client, source, id, null, askedBy(Object.keys(input.values), true));
};

export const updateRecord = async (
  client: Db,
  input: { objectKey: string; id: string; values: Record<string, unknown>; position?: number },
) => {
  const source = await recordSource(client, input.objectKey, true);
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

  return finish(client, source, input.id, current.values, askedBy(Object.keys(input.values)));
};

/** Moves a record to the recycle bin (`deleted`) or back out of it. */
export const setRecordDeleted = async (
  client: Db,
  objectKey: string,
  id: string,
  deleted: boolean,
) => {
  const source = await recordSource(client, objectKey, true);

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

  return answer(client, source, id);
};
