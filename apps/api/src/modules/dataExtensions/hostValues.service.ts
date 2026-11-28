import type { DataExtensionValuesUpdate } from '@erxes/core-contract';
import { callerUserId, type Db } from '@erxes/core-db';
import type { z } from 'zod';
import { textArray } from '@erxes/plugin-sdk/filter';
import { sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { assertRecordRight, findRecordType } from '~/modules/recordTypes/recordTypes.service';
import { columnParam } from './codec';
import { alias, customKeyOf, ensureTable, fieldsOf, qualified, tableOf } from './definitions';
import { valueColumns, valuesOf } from './recordQueries';
import { assertRecordsExist } from './references';
import { relationSides, writeRelation } from './relationValues';
import { asTaken } from './unique';
import { prepareValues } from './values';

/**
 * Data Extensions values on core's and plugins' records (`core.customer`, `hr.employee`),
 * in the record type's table (`ext_<plugin>_<type>`), a row per record that has any.
 */

const T = alias('t');
const IDS = alias('ids');

/** A core or plugin record type the caller may read (`read`) or change (`update`) values of. */
const hostType = async (client: Db, recordType: string, right: 'read' | 'update') => {
  if (customKeyOf(recordType)) {
    throw fail('INVALID_REFERENCE', 'A custom object’s values are its records’', {
      field: 'recordType',
    });
  }

  const type = await findRecordType(client, recordType);

  assertRecordRight(type, right);

  return type;
};

/** Values of these records: every field's value, null where none is kept. */
export const lookupValues = async (
  client: Db,
  input: { recordType: string; recordIds: string[] },
  right: 'read' | 'update' = 'read',
) => {
  await hostType(client, input.recordType, right);
  await assertRecordsExist(client, input.recordType, input.recordIds, 'recordId');

  const fields = await fieldsOf(client, input.recordType);
  const table = await tableOf(client, input.recordType);
  const sides = await relationSides(client, fields);
  const ids = [...new Set(input.recordIds)];

  if (!table) {
    return ids.map((recordId) => ({
      recordType: input.recordType,
      recordId,
      values: Object.fromEntries(fields.map((field) => [field.key, null])),
      updatedBy: null,
      updatedAt: null,
    }));
  }

  const columns = valueColumns(fields, sides, T, sql`${IDS}.id`);

  const { rows } = await client.execute(
    sql`select ${IDS}.id as record_id, ${T}.updated_by, ${T}.updated_at${columns.length ? sql`, ${sql.join(columns, sql`, `)}` : sql``}
      from unnest(${textArray(ids)}) as ${IDS}(id)
      left join ${qualified(table)} ${T} on ${T}.record_id = ${IDS}.id`,
  );

  return rows.map((row) => ({
    recordType: input.recordType,
    recordId: String(row.record_id),
    values: valuesOf(fields, sides, row),
    updatedBy: typeof row.updated_by === 'string' ? row.updated_by : null,
    updatedAt: row.updated_at instanceof Date ? row.updated_at : null,
  }));
};

const oneOf = async (
  client: Db,
  recordType: string,
  recordId: string,
  right: 'read' | 'update',
) => {
  const [values] = await lookupValues(client, { recordType, recordIds: [recordId] }, right);

  if (!values) throw new Error('A lookup of one record returned none');

  return values;
};

export const getValues = (client: Db, input: { recordType: string; recordId: string }) =>
  oneOf(client, input.recordType, input.recordId, 'read');

/** Changes some of a record's values; null clears one. */
export const updateValues = async (
  client: Db,
  input: z.infer<typeof DataExtensionValuesUpdate>,
) => {
  await hostType(client, input.recordType, 'update');
  await assertRecordsExist(client, input.recordType, [input.recordId], 'recordId');

  const fields = await fieldsOf(client, input.recordType);
  const sides = await relationSides(client, fields);
  const prepared = await prepareValues(client, fields, sides, input.values, false);
  const table = await ensureTable(client, input.recordType);
  const names = prepared.own.map(({ column }) => sql.identifier(column.name));
  const params = prepared.own.map(({ column, value }) => columnParam(column, value));

  const updates = [
    ...names.map((name) => sql`${name} = excluded.${name}`),
    sql`updated_by = excluded.updated_by`,
    sql`updated_at = now()`,
  ];

  await asTaken(table, fields, () =>
    client.execute(
      sql`insert into ${qualified(table)} (record_id, updated_by${names.length ? sql`, ${sql.join(names, sql`, `)}` : sql``})
        values (${input.recordId}, ${callerUserId()}${params.length ? sql`, ${sql.join(params, sql`, `)}` : sql``})
        on conflict (record_id) do update set ${sql.join(updates, sql`, `)}`,
    ),
  );
  await inOrder(prepared.outside, ({ side, value }) =>
    writeRelation(client, side, input.recordId, value),
  );

  return oneOf(client, input.recordType, input.recordId, 'update');
};
