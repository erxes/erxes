import type { DataResultType } from '@erxes/core-db';
import { type SQL, sql } from 'drizzle-orm';
import { storedColumn } from '../codec';
import { columnsOf } from '../columns';
import type { DataFieldRow } from '../definitions';
import { FormulaError } from './parse';
import type { Typed } from './types';

/** A stored field's value as formulas read it, and computed values as the API sends them. */

/** An auto number as members see it: `PRJ-0042`. */
export const autoNumberText = (field: Pick<DataFieldRow, 'settings'>, value: SQL) =>
  sql`(case when ${value} is null then null else ${field.settings.prefix ?? ''}::text || lpad(${value}::text, ${field.settings.digits ?? 1}, '0') end)`;

const TYPE_OF: Partial<Record<DataFieldRow['type'], DataResultType>> = {
  text: 'text',
  longText: 'text',
  email: 'text',
  phone: 'text',
  url: 'text',
  select: 'text',
  number: 'number',
  percent: 'number',
  rating: 'number',
  boolean: 'boolean',
  date: 'date',
  dateTime: 'dateTime',
};

/**
 * A stored field's value over `row` (its record's table or a plugin's view row, or null when
 * the record has no row): the type formulas see it as. Types a formula can't use throw
 * FormulaError.
 */
export const storedValue = (field: DataFieldRow, row: SQL | null, at: number): Typed => {
  const columns = columnsOf(field);

  const read = (part: string | null = null) => {
    const stored = columns.find((one) => one.part === part);

    return row && stored ? storedColumn(field, row, stored) : sql`null`;
  };

  const simple = TYPE_OF[field.type];

  if (simple)
    return { sql: simple === 'number' ? sql`(${read()})::numeric` : read(), type: simple };

  switch (field.type) {
    case 'currency':
      return { sql: read('amount'), type: 'number' };
    case 'fullName':
      return {
        sql: sql`nullif(concat_ws(' ', ${read('firstName')}, ${read('lastName')}), '')`,
        type: 'text',
      };
    case 'emails':
    case 'phones':
      return { sql: read('primary'), type: 'text' };
    case 'multiSelect':
    case 'textList':
      return { sql: sql`array_to_string(${read()}, ', ')`, type: 'text' };
    case 'member':
      if (field.settings.multiple) break;

      return { sql: read(), type: 'text' };
    case 'autoNumber':
      return { sql: autoNumberText(field, read()), type: 'text' };
    default:
      break;
  }

  throw new FormulaError(`{${field.key}} is a ${field.type} field, which formulas can't read`, at);
};

/** A computed value as the API sends it: JSON-ready, a number only while a float holds it. */
export const outputOf = ({ sql: value, type }: { sql: SQL; type: DataResultType }): SQL => {
  switch (type) {
    case 'number':
      return sql`(case when abs(${value}) < 1e300 then (${value})::float8 end)`;
    case 'date':
      return sql`(${value})::text`;
    case 'dateTime':
      return sql`to_char((${value}) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
    default:
      return value;
  }
};
