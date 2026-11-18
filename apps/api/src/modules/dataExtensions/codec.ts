import { textArray } from '@erxes/plugin-sdk/filter';
import { type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { type FieldColumn, columnsOf } from './columns';
import type { DataFieldRow } from './definitions';

/**
 * Values to columns and back. A field keeps its value in one column, or a composite's in one
 * column per part (`<column>_amount`, `<column>_currency`); relations are `relationValues.ts`'s.
 */

/** A column as a select reads it, so the driver hands back JSON-ready values. */
export const readColumn = (table: SQL, { name, type }: FieldColumn) => {
  const column = sql`${table}.${sql.identifier(name)}`;

  switch (type) {
    case 'date':
      return sql`${column}::text`;
    case 'numeric':
      return sql`${column}::float8`;
    case 'timestamptz':
      return sql`to_char(${column} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
    default:
      return column;
  }
};

/** A value as a parameter of the column's type. */
export const columnParam = ({ type }: FieldColumn, value: unknown): SQL => {
  if (value === null || value === undefined) return sql`null`;

  switch (type) {
    case 'text[]':
      return textArray(z.array(z.string()).parse(value));
    case 'jsonb':
      return sql`${JSON.stringify(value)}::jsonb`;
    case 'numeric':
      return sql`${z.number().parse(value)}::numeric`;
    case 'smallint':
      return sql`${z.int().parse(value)}::smallint`;
    case 'boolean':
      return sql`${z.boolean().parse(value)}::boolean`;
    case 'date':
      return sql`${z.string().parse(value)}::date`;
    case 'timestamptz':
      return sql`${z.string().parse(value)}::timestamptz`;
    case 'text':
      return sql`${z.string().parse(value)}::text`;
  }
};

const PartsOf = z.record(z.string(), z.unknown());

/** Each stored column of a field with the part of the value it holds. */
export const columnsWithValues = (field: DataFieldRow, value: unknown) =>
  columnsOf(field).map((column) => {
    if (column.part === null) return { column, value };

    const parts = PartsOf.safeParse(value).data;
    const part = parts?.[column.part] ?? null;

    // A list value's rest is a list even when empty, so reads give back what was written.
    return { column, value: column.part === 'additional' && parts ? (part ?? []) : part };
  });

const isEmpty = (value: unknown) => value === null || (Array.isArray(value) && value.length === 0);

/** A field's value from a row read with `readColumn`, keyed by column name. */
export const valueFromRow = (field: DataFieldRow, row: Record<string, unknown>) => {
  const columns = columnsOf(field);
  const [only] = columns;

  if (only && only.part === null) return row[only.name] ?? null;

  const parts = Object.fromEntries(
    columns.map((column) => [column.part ?? column.name, row[column.name] ?? null]),
  );

  if (Object.values(parts).every(isEmpty)) return null;

  return 'additional' in parts ? { ...parts, additional: parts.additional ?? [] } : parts;
};

/** Words of a record's text values, for its search column. */
const SEARCH_TYPES = new Set(['text', 'email', 'phone', 'url', 'select', 'fullName', 'emails']);

const textsOf = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];

  if (Array.isArray(value)) return value.flatMap(textsOf);

  if (value && typeof value === 'object') return Object.values(value).flatMap(textsOf);

  return [];
};

/** The text a record is found by: its text-like fields' values. */
export const searchText = (fields: DataFieldRow[], values: Record<string, unknown>) =>
  fields
    .filter((field) => SEARCH_TYPES.has(field.type))
    .flatMap((field) => textsOf(values[field.key]))
    .join(' ')
    .slice(0, 20_000);

/** A search box's words as a prefix query: `acme co` finds "Acme Corp". */
export const searchQuery = (search: string) => {
  const words = search.match(/[\p{L}\p{N}]+/gu) ?? [];

  return words.length ? words.map((word) => `${word}:*`).join(' & ') : null;
};
