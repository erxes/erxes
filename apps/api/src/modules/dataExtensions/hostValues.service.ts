import type { DataExtensionValuesUpdate } from '@erxes/core-contract';
import { callerUserId, type Db } from '@erxes/core-db';
import type { z } from 'zod';
import { textArray } from '@erxes/plugin-sdk/filter';
import { sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { assertRecordRight, findRecordType } from '~/modules/recordTypes/recordTypes.service';
import { columnParam } from './codec';
import { pluginOf } from './columns';
import { nativeSources } from './nativeSources';
import { computedFor } from './computed';
import { alias, customKeyOf, ensureTable, fieldsOf, qualified, tableOf } from './definitions';
import { valueColumns, valuesOf } from './recordQueries';
import { assertRecordsExist } from './references';
import { relationSides, writeRelation } from './relationValues';
import { readableFields } from './fieldAccess';
import { asTaken } from './unique';
import { prepareValues } from './values';
import { afterWrite } from './writeRules';

/**
 * Data Extensions values on core's and plugins' records (`core.customer`, `hr.employee`).
 * Core keeps its own records' values in the record type's table (`ext_core_<type>`), a row per
 * record that has any; a plugin keeps its records' in its own tables, and core reads them from
 * the `custom_fields` of the plugin's view.
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

/**
 * The row, `t`, a record's values are read from: its row in core's table, with who changed
 * them last, or for a plugin's record its view's row (`custom_fields`). Null when there is
 * none to read.
 */
const valuesRow = async (client: Db, recordType: string) => {
  if (pluginOf(recordType)) {
    const natives = await nativeSources(client);
    const from = natives(recordType)?.from;

    return from
      ? {
          join: sql`left join ${from} ${T} on ${T}.id = ${IDS}.id`,
          changed: sql`null::text as updated_by, null::timestamptz as updated_at`,
          natives,
        }
      : null;
  }

  const table = await tableOf(client, recordType);

  return table
    ? {
        join: sql`left join ${qualified(table)} ${T} on ${T}.record_id = ${IDS}.id`,
        changed: sql`${T}.updated_by, ${T}.updated_at`,
        natives: undefined,
      }
    : null;
};

/**
 * Values of these records, null where none is kept: the fields the caller may read, or every
 * field with `everything` (the checks and history a write makes).
 */
const readValues = async (
  client: Db,
  input: { recordType: string; recordIds: string[] },
  everything: boolean,
) => {
  const all = await fieldsOf(client, input.recordType);
  const from = await valuesRow(client, input.recordType);
  const sides = await relationSides(client, all, from?.natives);
  const ids = [...new Set(input.recordIds)];
  const id = sql`${IDS}.id`;
  const computed = await computedFor(client, input.recordType, all, T, id);
  const fields = everything ? all : await readableFields(client, all, computed.uses);

  if (!from) {
    return ids.map((recordId) => ({
      recordType: input.recordType,
      recordId,
      values: Object.fromEntries(fields.map((field) => [field.key, null])),
      updatedBy: null,
      updatedAt: null,
    }));
  }

  const columns = valueColumns(fields, sides, T, id, computed.values);

  const { rows } = await client.execute(
    sql`select ${IDS}.id as record_id, ${from.changed}${columns.length ? sql`, ${sql.join(columns, sql`, `)}` : sql``}
      from unnest(${textArray(ids)}) as ${IDS}(id)
      ${from.join}${computed.join}`,
  );

  return rows.map((row) => ({
    recordType: input.recordType,
    recordId: String(row.record_id),
    values: valuesOf(fields, sides, row),
    updatedBy: typeof row.updated_by === 'string' ? row.updated_by : null,
    updatedAt: row.updated_at instanceof Date ? row.updated_at : null,
  }));
};

/** Values of these records the caller may read: each readable field's value, null where none is kept. */
export const lookupValues = async (
  client: Db,
  input: { recordType: string; recordIds: string[] },
  right: 'read' | 'update' = 'read',
) => {
  await hostType(client, input.recordType, right);
  await assertRecordsExist(client, input.recordType, input.recordIds, 'recordId');

  return readValues(client, input, false);
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

/** Every value of one record, the caller's hidden fields included. */
const allValues = async (client: Db, recordType: string, recordId: string) =>
  (await readValues(client, { recordType, recordIds: [recordId] }, true))[0]?.values ?? {};

export const getValues = (client: Db, input: { recordType: string; recordId: string }) =>
  oneOf(client, input.recordType, input.recordId, 'read');

/**
 * Changes some of a core record's values; null clears one. 400 INVALID_REFERENCE for a
 * plugin's record type, whose plugin keeps the values.
 */
export const updateValues = async (
  client: Db,
  input: z.infer<typeof DataExtensionValuesUpdate>,
) => {
  const plugin = pluginOf(input.recordType);

  if (plugin) {
    throw fail(
      'INVALID_REFERENCE',
      `${plugin} keeps its records’ values; it checks them with dataValues.check`,
      { field: 'recordType' },
    );
  }

  await hostType(client, input.recordType, 'update');
  await assertRecordsExist(client, input.recordType, [input.recordId], 'recordId');

  const fields = await fieldsOf(client, input.recordType);
  const sides = await relationSides(client, fields);
  const before = await allValues(client, input.recordType, input.recordId);
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
  await afterWrite(client, {
    recordType: input.recordType,
    recordId: input.recordId,
    fields,
    before,
    after: await allValues(client, input.recordType, input.recordId),
  });

  return oneOf(client, input.recordType, input.recordId, 'update');
};
