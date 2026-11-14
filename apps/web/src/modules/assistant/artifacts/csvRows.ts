import { parse } from 'csv-parse/browser/esm/sync';
import { z } from 'zod';

const Rows = z.array(z.array(z.string()));

export const csvRows = (csv: string) => {
  try {
    return Rows.parse(parse(csv, { relax_column_count: true, skip_empty_lines: true, bom: true }));
  } catch {
    return [];
  }
};

const NUMBER = /^-?\d+(\.\d+)?$/;

export const isNumeric = (cell: string) => NUMBER.test(cell.trim());
