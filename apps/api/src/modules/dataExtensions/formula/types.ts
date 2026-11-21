import type { DataResultType } from '@erxes/core-db';
import { type SQL, sql } from 'drizzle-orm';
import { FormulaError } from './parse';

/** A formula's values as typed SQL, and the checks and casts between their types. */

/** What a value is; `null` is the bare NULL, which takes any type. */
export type ValueType = DataResultType | 'null';

export interface Typed {
  sql: SQL;
  type: ValueType;
}

/** A missing argument, which arity checks rule out before any function builds. */
export const NULL: Typed = { sql: sql`null`, type: 'null' };

export const PG_TYPES: Record<DataResultType, SQL> = {
  number: sql.raw('numeric'),
  text: sql.raw('text'),
  boolean: sql.raw('boolean'),
  date: sql.raw('date'),
  dateTime: sql.raw('timestamptz'),
};

const NAMES: Record<ValueType, string> = {
  number: 'a number',
  text: 'text',
  boolean: 'yes or no',
  date: 'a date',
  dateTime: 'a date and time',
  null: 'empty',
};

/** The one type of these values: a date with dates and times is a date and time. */
export const unify = (values: Typed[], at: number, what: string): ValueType => {
  const types = new Set(values.map((value) => value.type).filter((type) => type !== 'null'));

  if (types.size === 2 && types.has('date') && types.has('dateTime')) return 'dateTime';

  if (types.size > 1) {
    throw new FormulaError(
      `${what} mixes ${[...types].map((type) => NAMES[type]).join(' and ')}`,
      at,
    );
  }

  return [...types][0] ?? 'null';
};

/** `value` as `type`: a bare NULL typed, a date as the start of its day. */
export const as = (value: Typed, type: ValueType): SQL => {
  if (type === 'null' || value.type === type) return value.sql;

  if (value.type === 'null') return sql`null::${PG_TYPES[type]}`;

  return sql`(${value.sql})::${PG_TYPES[type]}`;
};

/** Throws FormulaError unless `value` is one of `types` (or empty). */
export const need = (value: Typed, types: ValueType[], at: number, what: string) => {
  if (value.type !== 'null' && !types.includes(value.type)) {
    throw new FormulaError(
      `${what} needs ${types.map((type) => NAMES[type]).join(' or ')}, not ${NAMES[value.type]}`,
      at,
    );
  }
};

/** A whole number for counts and places, clamped so no cast can overflow. */
export const clampInt = (value: Typed, low: number, high: number) =>
  sql`least(greatest(round(${as(value, 'number')}), ${low}), ${high})::int`;

/** Any value as text, the way lists show it. */
export const textOf = (value: Typed): SQL => {
  switch (value.type) {
    case 'text':
      return value.sql;
    case 'number':
      return sql`trim_scale(${value.sql})::text`;
    case 'dateTime':
      return sql`to_char((${value.sql}) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`;
    case 'null':
      return sql`null::text`;
    default:
      return sql`(${value.sql})::text`;
  }
};
