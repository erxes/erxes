import type { DataFieldOption, DataFieldSettings, Db } from '@erxes/core-db';
import type { DATA_EXTENSION_CONVERTIBLE_TYPES } from '@erxes/core-db/dataExtensionEnums';
import { DATA_EXTENSION_OPTION_COLORS } from '@erxes/core-db/dataExtensionEnums';
import { dataFields } from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { eq, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail, pgCode } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { columnsOf, type FieldColumn, freeColumn } from './columns';
import { assertUnread } from './computedRules';
import { addColumns, changeSchema, dropColumns, setUnique } from './ddl';
import { findField, qualified, tableOf } from './definitions';
import { assertFieldDefinition, takenColumns } from './fieldRules';

/**
 * Converting a field to another type: its values go to a new column of that type, each one
 * that fits carried over (`'42'` → 42, `'yes'` → true), the rest cleared. A dry run counts both.
 */

type Convertible = (typeof DATA_EXTENSION_CONVERTIBLE_TYPES)[number];

/** Types a unique value can be asked of. */
const UNIQUE_TYPES: ReadonlySet<string> = new Set(['text', 'email', 'phone', 'url', 'number']);

/** Text that reads as yes or no, for a boolean. */
const YES = ['true', 'yes', 'y', '1', 'on'];
const NO = ['false', 'no', 'n', '0', 'off'];

/** Settings every type takes, kept through a conversion. */
const KEPT_SETTINGS = [
  'required',
  'group',
  'showInCreate',
  'placeholder',
  'readOnly',
  'visibleWhen',
  'requiredWhen',
  'visibleTo',
  'editableBy',
] as const;

/** A value of the column as text, the way a member would have typed it. */
const asText = ({ type }: FieldColumn, value: SQL): SQL => {
  switch (type) {
    case 'numeric':
      return sql`trim_scale(${value})::text`;
    case 'boolean':
      return sql`(case when ${value} then 'true' else 'false' end)`;
    case 'timestamptz':
      return sql`to_char(${value} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
    case 'text[]':
      return sql`nullif(array_to_string(${value}, ', '), '')`;
    default:
      return sql`${value}::text`;
  }
};

const valid = (text: SQL, type: string) => sql`pg_input_is_valid(trim(${text}), ${type})`;

/** Text as a number, or null. */
const textNumber = (text: SQL) =>
  sql`(case when ${valid(text, 'numeric')} then trim(${text})::numeric end)`;

/** `value` (of `from`'s column) as the type `to`, or null where it doesn't fit. */
const castTo = (
  from: FieldColumn,
  to: Convertible,
  value: SQL,
  ctx: { options: string[]; scale: number },
) => {
  const text = asText(from, value);

  const number =
    from.type === 'numeric' || from.type === 'smallint' ? sql`${value}::numeric` : textNumber(text);

  const options = textArray(ctx.options);

  switch (to) {
    case 'number':
    case 'percent':
      return from.type === 'boolean'
        ? sql`(case when ${value} then 1 else 0 end)::numeric`
        : number;
    case 'rating':
      return sql`(case when ${number} = round(${number}) and ${number} between 1 and ${ctx.scale} then ${number}::smallint end)`;
    case 'boolean':
      return from.type === 'numeric' || from.type === 'smallint'
        ? sql`(${value} <> 0)`
        : sql`(case when lower(trim(${text})) = any(${textArray(YES)}) then true when lower(trim(${text})) = any(${textArray(NO)}) then false end)`;
    case 'date':
      return from.type === 'timestamptz'
        ? sql`(${value} at time zone 'UTC')::date`
        : sql`(case when ${valid(text, 'date')} then trim(${text})::date end)`;
    case 'dateTime':
      return from.type === 'date'
        ? sql`(${value}::timestamp at time zone 'UTC')`
        : sql`(case when ${valid(text, 'timestamptz')} then trim(${text})::timestamptz end)`;
    case 'select':
      return sql`(case when trim(${text}) = any(${options}) then trim(${text}) end)`;
    case 'multiSelect':
      return from.type === 'text[]'
        ? sql`nullif(array(select v from unnest(${value}) v where v = any(${options})), '{}')`
        : sql`(case when trim(${text}) = any(${options}) then array[trim(${text})] end)`;
    case 'email':
      return sql`(case when trim(${text}) ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$' and length(trim(${text})) <= 254 then lower(trim(${text})) end)`;
    case 'phone':
      return sql`(case when trim(${text}) ~ '^\\+?[0-9 ()-]{3,32}$' then trim(${text}) end)`;
    case 'url':
      return sql`(case when trim(${text}) ~* '^https?://[^[:space:]]+$' then trim(${text}) end)`;
    case 'text':
    case 'longText':
      return text;
  }
};

const has = (column: FieldColumn, value: SQL) =>
  column.type === 'text[]'
    ? sql`coalesce(cardinality(${value}), 0) > 0`
    : sql`${value} is not null`;

/** A select's options made from the field's values: each distinct one that can be an option. */
const optionsFromValues = async (client: Db, table: string, from: FieldColumn) => {
  const column = sql`${sql.identifier(from.name)}`;
  const each = from.type === 'text[]' ? sql`unnest(${column})` : asText(from, column);

  const { rows } = await client.execute<{ value: string }>(
    sql`select distinct trim(v) as value from (select ${each} as v from ${qualified(table)}) s
      where trim(v) ~ '^[^,{}"\\\\]{1,100}$' order by 1 limit 101`,
  );

  if (rows.length > 100) {
    throw fail('INVALID_INPUT', 'The values make more than 100 options: send the options', {
      issues: [{ path: ['options'], message: 'More than 100 distinct values' }],
    });
  }

  return rows.map(({ value }, index): DataFieldOption => ({
    value,
    label: value,
    color: DATA_EXTENSION_OPTION_COLORS[index % DATA_EXTENSION_OPTION_COLORS.length] ?? 'gray',
  }));
};

const Counts = z.object({
  converted: z.coerce.number(),
  unconvertible: z.coerce.number(),
  samples: z.array(z.string()).nullable(),
});

/** The settings the field keeps as `to`. */
const keptSettings = (settings: DataFieldSettings, to: Convertible): DataFieldSettings => ({
  ...Object.fromEntries(
    KEPT_SETTINGS.flatMap((key) => (key in settings ? [[key, settings[key]]] : [])),
  ),
  ...(settings.unique && UNIQUE_TYPES.has(to) ? { unique: true } : {}),
});

/**
 * Converts a field (a dry run unless `apply`): 400 INVALID_TYPE for a field that can't be, 409
 * UNCONVERTIBLE when values would be cleared without `clearUnconvertible`, 409 FIELD_IN_USE
 * while a formula or rollup reads it, 409 TAKEN when it stays unique and values repeat.
 */
export const convertField = async (
  client: Db,
  input: {
    id: string;
    type: Convertible;
    options?: DataFieldOption[];
    apply: boolean;
    clearUnconvertible: boolean;
  },
) => {
  const field = await findField(client, input.id);
  const [from] = columnsOf(field);
  const table = await tableOf(client, field.recordType);

  if (
    !from ||
    columnsOf(field).length !== 1 ||
    field.type === 'relation' ||
    field.type === input.type
  ) {
    throw fail('INVALID_TYPE', `A ${field.type} field can't be converted to ${input.type}`);
  }

  const choosing = input.type === 'select' || input.type === 'multiSelect';

  const options =
    input.options ??
    (choosing
      ? field.options.length
        ? field.options
        : table
          ? await optionsFromValues(client, table, from)
          : []
      : []);

  const settings = keptSettings(field.settings, input.type);

  assertFieldDefinition({ type: input.type, options, settings });

  const old = sql`${sql.identifier(from.name)}`;

  const cast = castTo(from, input.type, old, {
    options: options.map((option) => option.value),
    scale: field.settings.scale ?? 5,
  });

  const to = columnsOf({ type: input.type, column: 'v', relation: null, settings })[0];

  if (!to) throw fail('INVALID_TYPE', `${input.type} keeps no column`);

  const counts = table
    ? Counts.parse(
        (
          await client.execute(
            sql`select count(*) filter (where ${has(from, old)} and ${has(to, cast)}) as converted,
              count(*) filter (where ${has(from, old)} and not ${has(to, cast)}) as unconvertible,
              (array_agg(${asText(from, old)}) filter (where ${has(from, old)} and not ${has(to, cast)}))[1:5] as samples
            from ${qualified(table)}`,
          )
        ).rows[0],
      )
    : { converted: 0, unconvertible: 0, samples: [] };

  const result = { ...counts, samples: counts.samples ?? [], options };

  if (!input.apply) return { ...result, field: null };

  if (counts.unconvertible && !input.clearUnconvertible) {
    throw fail('UNCONVERTIBLE', `${counts.unconvertible} values don't fit ${input.type}`, {
      count: counts.unconvertible,
    });
  }

  await assertUnread(client, [field.id], field.label);

  const column = freeColumn(field.key, await takenColumns(client, field.recordType));

  if (table)
    await moveValues(client, {
      table,
      from,
      to: { ...to, name: column },
      cast,
      unique: Boolean(settings.unique),
      label: field.label,
    });

  const converted = oneRow(
    await client
      .update(dataFields)
      .set({ type: input.type, column, options, settings, updatedAt: sql`now()` })
      .where(eq(dataFields.id, field.id))
      .returning(),
  );

  return { ...result, field: converted };
};

/** Fills the new column from the old one, drops the old one and makes the new one unique if asked. */
const moveValues = (
  client: Db,
  input: {
    table: string;
    from: FieldColumn;
    to: FieldColumn;
    cast: SQL;
    unique: boolean;
    label: string;
  },
) =>
  changeSchema(client, async () => {
    await addColumns(client, input.table, [input.to]);
    await client.execute(
      sql`update ${qualified(input.table)} set ${sql.identifier(input.to.name)} = ${input.cast}`,
    );
    await dropColumns(client, input.table, [input.from]);

    if (!input.unique) return;

    try {
      await setUnique(client, input.table, input.to.name, true);
    } catch (error) {
      if (pgCode(error) !== '23505') throw error;

      throw fail('TAKEN', `Some records share a ${input.label} after the conversion`, {
        field: 'type',
      });
    }
  });
