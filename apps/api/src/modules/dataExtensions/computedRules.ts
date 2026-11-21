import { type Db, type DataFieldSettings, dataFields, newId } from '@erxes/core-db';
import { and, eq, inArray, not, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { assertRecordRight } from '~/modules/recordTypes/recordTypes.service';
import { extendableType } from './fieldRules';
import { Computer } from './computed';
import { alias, customKeyOf, type DataFieldRow, qualified } from './definitions';
import { resultOf } from './formula/compile';
import { outputOf } from './formula/fieldValue';
import { FormulaError } from './formula/parse';
import { assertRecordsExist } from './references';

/** Formula and rollup definitions: checked before they are saved, and tried on one record. */

const T = alias('t');
const IDS = alias('ids');

type Computed = { id: string; type: DataFieldRow['type']; settings: DataFieldSettings };

type Formula = NonNullable<DataFieldSettings['formula']>;

type Rollup = NonNullable<DataFieldSettings['rollup']>;

/** Where in the settings a problem is: the formula's text and the character, or the rollup. */
const problemPath = (field: Computed, at: number) =>
  field.type === 'formula'
    ? ['settings', 'formula', 'expression', at]
    : ['settings', 'rollup', ...(field.settings.rollup?.where ? ['where', at] : [])];

/**
 * A formula or rollup checked against its record type, as SQL over a query of that type alone
 * (`t` its Data Extensions row, `ids.id` a core or plugin record's id). 400 INVALID_INPUT names
 * the problem, and for a formula the character it is at (the issue path's last part).
 */
const compile = async (client: Db, recordType: string, field: Computed) => {
  const computer = await Computer.create(client);
  const model = await computer.model(recordType);
  const own = computer.alias('own');
  const custom = customKeyOf(recordType) !== null;
  const id = custom ? sql`${T}.id` : sql`${IDS}.id`;
  const row = { ext: T, native: computer.nativeRow(model, T, own), id };
  const value = resultOf(await computer.ofSettings(model, row, field, [field.id]));
  const join = custom ? sql`` : computer.nativeJoin(model, own, id);

  return { value, model, join, uses: computer.uses };
};

const compiled = async (client: Db, recordType: string, field: Computed) => {
  try {
    return await compile(client, recordType, field);
  } catch (error) {
    if (!(error instanceof FormulaError)) throw error;

    throw fail('INVALID_INPUT', error.message, {
      issues: [{ path: problemPath(field, error.at), message: error.message }],
    });
  }
};

/** The settings with the result type the API found, so web shows and filters it right. */
export const checkComputed = async (client: Db, recordType: string, field: Computed) => {
  const { value } = await compiled(client, recordType, field);
  const { formula, rollup } = field.settings;

  return {
    ...field.settings,
    ...(formula ? { formula: { ...formula, result: value.type } } : {}),
    ...(rollup ? { rollup: { ...rollup, result: value.type } } : {}),
  };
};

/** The fields a formula or rollup reads (relations walked included), by id; none when it can't be read. */
const usesOf = async (client: Db, field: DataFieldRow) => {
  try {
    return (await compile(client, field.recordType, field)).uses;
  } catch (error) {
    if (error instanceof FormulaError) return new Set<string>();

    throw error;
  }
};

/**
 * Throws 409 FIELD_IN_USE when an active formula or rollup reads one of `ids` (a field and its
 * relation's pair): renaming or archiving it would break that one.
 */
export const assertUnread = async (client: Db, ids: string[], label: string) => {
  const readers = await client
    .select()
    .from(dataFields)
    .where(
      and(
        inArray(dataFields.type, ['formula', 'rollup']),
        eq(dataFields.status, 'active'),
        not(inArray(dataFields.id, ids)),
      ),
    );

  const uses = await Promise.all(
    readers.map(async (reader) => [reader, await usesOf(client, reader)] as const),
  );

  const found = uses.find(([, read]) => ids.some((id) => read.has(id)));

  if (found) {
    const [reader] = found;

    throw fail('FIELD_IN_USE', `${reader.label} reads ${label}: change it first`, {
      fieldId: reader.id,
    });
  }
};

/** A preview's formula or rollup as an unsaved field. */
const unsaved = (input: { formula?: Formula; rollup?: Rollup }): Computed => {
  if (input.formula) return { id: newId(), type: 'formula', settings: { formula: input.formula } };

  if (input.rollup) return { id: newId(), type: 'rollup', settings: { rollup: input.rollup } };

  throw fail('INVALID_INPUT', 'Send a formula or a rollup', {
    issues: [{ path: ['formula'], message: 'Send a formula or a rollup' }],
  });
};

/**
 * What a formula or rollup gives, and its value on one record when `recordId` is given (one
 * the caller may read).
 */
export const previewComputed = async (
  client: Db,
  input: { recordType: string; formula?: Formula; rollup?: Rollup; recordId?: string },
) => {
  const recordType = await extendableType(client, input.recordType);
  const { value, model, join } = await compiled(client, input.recordType, unsaved(input));

  if (!input.recordId) return { result: value.type, value: null };

  assertRecordRight(recordType, 'read');
  await assertRecordsExist(client, input.recordType, [input.recordId], 'recordId');

  const read = sql`${outputOf(value)} as value`;
  const table = model.table ? qualified(model.table) : null;

  const query = customKeyOf(input.recordType)
    ? sql`select ${read} from ${table} ${T} where ${T}.id = ${input.recordId}`
    : sql`select ${read} from (select ${input.recordId}::text as id) ${IDS}${
        table ? sql` left join ${table} ${T} on ${T}.record_id = ${IDS}.id` : sql``
      }${join}`;

  const { rows } = await client.execute<{ value: unknown }>(query);

  // Typed as the JSON the contract sends: `outputOf` reads it as a JSON-ready type.
  return {
    result: value.type,
    value: z
      .json()
      .nullable()
      .parse(rows[0]?.value ?? null),
  };
};
