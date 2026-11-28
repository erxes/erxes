import { z } from 'zod';
import { GatewayError } from '@erxes/plugin-sdk/integrations';
import { sha256 } from '~/lib/crypto';

export const Cell = z.union([z.string(), z.number(), z.boolean()]);

type Value = z.infer<typeof Cell>;

export type Row = Value[];

export const NO_SHEET = 'This spreadsheet has no sheet with that name';

const MAX_MATCHES = 1000;

export const refuse = (message: string) => new GatewayError(message, 400);

export const columnLetter = (index: number): string =>
  (index >= 26 ? columnLetter(Math.floor(index / 26) - 1) : '') +
  String.fromCodePoint(65 + (index % 26));

export const columnNames = (header: Row) => {
  const taken = new Set<string>();

  return header.map((cell, index) => {
    const text = String(cell).trim();
    const name = text && !taken.has(text) ? text : columnLetter(index);

    taken.add(name);

    return name;
  });
};

export const isBlank = (row: Row) => row.every((cell) => String(cell).trim() === '');

export const rowHash = (row: Row) => sha256(JSON.stringify(row), 'base64url').slice(0, 11);

/** The row's cells under their column names, as triggers and "Find rows" give them. */
export const rowRecord = (names: string[], row: Row): Record<string, Value> =>
  Object.fromEntries(
    Array.from({ length: Math.max(names.length, row.length) }, (_, column) => [
      names[column] ?? columnLetter(column),
      row[column] ?? '',
    ]),
  );

export const rowEvent = (names: string[], row: Row, index: number, version: string) => {
  const rowNumber = index + 2;

  return { id: `${rowNumber}:${version}`, payload: { ...rowRecord(names, row), rowNumber } };
};

/** Finds a column's position by its name in the first row, ignoring case. */
export const columnsOf = (header: Row) => {
  if (!header.length) throw refuse('The sheet has no column names: add them in its first row');

  const names = columnNames(header);
  const index = new Map(names.map((name, at) => [name.toLowerCase(), at]));

  return {
    names,
    at(column: string) {
      const at = index.get(column.trim().toLowerCase());

      if (at === undefined)
        throw refuse(`The sheet has no column named "${column}": use a name from its first row`);

      return at;
    },
  };
};

export type Columns = ReturnType<typeof columnsOf>;

export const rowOf = (columns: Columns, values: Record<string, string>) => {
  const row: string[] = columns.names.map(() => '');

  for (const [column, value] of Object.entries(values)) row[columns.at(column)] = value;

  return row;
};

const same = (cell: Value | undefined, value: string) =>
  String(cell ?? '')
    .trim()
    .toLowerCase() === value.trim().toLowerCase();

/** The rows (with their numbers in the sheet) whose every `match` column holds its value. */
export const matchingRows = (columns: Columns, data: Row[], match: Record<string, string>) => {
  const conditions = Object.entries(match).map(([column, value]) => ({
    at: columns.at(column),
    value,
  }));

  return data.flatMap((row, index) =>
    !isBlank(row) && conditions.every(({ at, value }) => same(row[at], value))
      ? [{ row, rowNumber: index + 2 }]
      : [],
  );
};

/** The rows a step may change in one go. */
export const changeable = <T>(rows: T[]) => {
  if (rows.length > MAX_MATCHES)
    throw refuse(
      `More than ${MAX_MATCHES.toLocaleString('en')} rows match: narrow the columns to match on`,
    );

  return rows;
};
