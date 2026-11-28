import type { DataExtensionFieldUpdate } from '@erxes/core-contract';
import type { Db, DataFieldOption } from '@erxes/core-db';
import type { z } from 'zod';
import { dataFields } from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { eq, sql } from 'drizzle-orm';
import { fail, pgCode } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { columnsOf, isComputed } from './columns';
import { assertUnread, checkComputed } from './computedRules';
import { changeSchema, setUnique } from './ddl';
import { type DataFieldRow, findField, qualified, tableOf } from './definitions';
import { assertFieldDefinition } from './fieldRules';

type FieldType = DataFieldRow['type'];

/** Type changes a field's column takes as it is. */
const SAME_COLUMN: readonly (readonly FieldType[])[] = [
  ['text', 'longText'],
  ['number', 'percent'],
];

const sameColumn = (from: FieldType, to: FieldType) =>
  from === to || SAME_COLUMN.some((pair) => pair.includes(from) && pair.includes(to));

/** Clears option values a select no longer has from every record. */
const clearDropped = async (client: Db, field: DataFieldRow, options: DataFieldOption[]) => {
  const kept = new Set(options.map((option) => option.value));
  const dropped = field.options.map((option) => option.value).filter((value) => !kept.has(value));
  const table = await tableOf(client, field.recordType);
  const [only] = columnsOf(field);

  if (!dropped.length || !table || !only) return;

  const column = sql.identifier(only.name);
  const gone = textArray(dropped);

  await client.execute(
    field.type === 'multiSelect'
      ? sql`update ${qualified(table)} set ${column} = array(select v from unnest(${column}) v where v <> all(${gone})) where ${column} && ${gone}`
      : sql`update ${qualified(table)} set ${column} = null where ${column} = any(${gone})`,
  );
};

/** Adds or drops the unique index when the setting changes. */
const syncUnique = async (client: Db, field: DataFieldRow, unique: boolean) => {
  const table = await tableOf(client, field.recordType);
  const [only] = columnsOf(field);

  if (!table || !only || Boolean(field.settings.unique) === unique) return;

  try {
    await changeSchema(client, () => setUnique(client, table, only.name, unique));
  } catch (error) {
    if (pgCode(error) !== '23505') throw error;

    throw fail('TAKEN', `Some records share a ${field.label}; make them differ first`, {
      field: 'settings.unique',
    });
  }
};

/**
 * Changes a field. Its key may change (the column stays); its type only to one that keeps the
 * column (400 INVALID_TYPE otherwise); options are replaced whole, and values of dropped ones
 * cleared; settings are replaced whole.
 */
export const updateField = async (
  client: Db,
  { id, ...changes }: z.infer<typeof DataExtensionFieldUpdate>,
) => {
  const field = await findField(client, id);

  const next = {
    type: changes.type ?? field.type,
    options: changes.options ?? field.options,
    settings: changes.settings ?? field.settings,
  };

  if (field.type === 'relation' && changes.type) {
    throw fail('INVALID_TYPE', 'A relation stays a relation');
  }

  if (!sameColumn(field.type, next.type)) {
    throw fail('INVALID_TYPE', `A ${field.type} field can't become ${next.type}`);
  }

  if (
    field.type === 'member' &&
    Boolean(field.settings.multiple) !== Boolean(next.settings.multiple)
  ) {
    throw fail('INVALID_TYPE', 'A member field keeps holding one member or several');
  }

  if (field.type !== 'relation') assertFieldDefinition(next);

  if (changes.key && changes.key !== field.key) await assertUnread(client, [id], field.label);

  const settings =
    changes.settings && isComputed(next.type)
      ? await checkComputed(client, field.recordType, { ...next, id })
      : changes.settings;

  if (changes.options) await clearDropped(client, field, changes.options);

  await syncUnique(client, field, Boolean(next.settings.unique));

  return oneRow(
    await client
      .update(dataFields)
      .set({ ...changes, settings, updatedAt: sql`now()` })
      .where(eq(dataFields.id, id))
      .returning(),
  );
};
