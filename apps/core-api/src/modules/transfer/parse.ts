import { parse } from 'csv-parse/sync';
import readXlsxFile, { type CellValue } from 'read-excel-file/node';

/** More than this many rows is refused (split the file). */
export const MAX_IMPORT_ROWS = 100_000;

export class ParseError extends Error {}

const isExcel = (name: string, contentType: string) =>
  /\.xlsx$/i.test(name) ||
  contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** The delimiter used most in the first line: `,`, `;` (European Excel) or a tab. */
const delimiterOf = (text: string) => {
  const line = text.slice(0, text.search(/\r?\n/) === -1 ? undefined : text.search(/\r?\n/));

  const counts = [',', ';', '\t'].map(
    (delimiter) => [delimiter, line.split(delimiter).length - 1] as const,
  );

  return counts.toSorted((a, b) => b[1] - a[1])[0]?.[0] ?? ',';
};

/** A CSV cell, or an Excel cell (read-excel-file types its dates as `typeof Date`; they are `Date`s). */
const cellText = (value: CellValue | null | undefined): string => {
  if (typeof value === 'string') return value.trim();

  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);

  return '';
};

/**
 * A CSV (UTF-8, with or without BOM; comma, semicolon or tab) or Excel
 * (.xlsx, first sheet) file → its header row and data rows, all as text.
 * Fully empty rows are dropped.
 */
export const parseSheet = async (
  body: Buffer,
  name: string,
  contentType: string,
): Promise<{ headers: string[]; rows: string[][] }> => {
  let table: string[][];

  try {
    if (isExcel(name, contentType)) {
      const sheets = await readXlsxFile(body);

      table = (sheets[0]?.data ?? []).map((row) => row.map(cellText));
    } else {
      const text = body.toString('utf8').replace(/^﻿/, '');

      table = parse(text, {
        delimiter: delimiterOf(text),
        relax_column_count: true,
        relax_quotes: true,
        skip_empty_lines: true,
        bom: true,
      });
      table = table.map((row) => row.map(cellText));
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    throw new ParseError(`The file could not be read: ${reason.slice(0, 200)}`);
  }

  const [header = [], ...rest] = table;
  const rows = rest.filter((row) => row.some((cell) => cell !== ''));

  if (!header.some((cell) => cell !== ''))
    throw new ParseError('The first row should name the columns');

  if (!rows.length) throw new ParseError('The file has no rows under its header');

  if (rows.length > MAX_IMPORT_ROWS)
    throw new ParseError(
      `At most ${MAX_IMPORT_ROWS.toLocaleString('en')} rows per import (this file has ${rows.length.toLocaleString('en')})`,
    );

  return { headers: header.map((cell, index) => cell || `Column ${index + 1}`), rows };
};
