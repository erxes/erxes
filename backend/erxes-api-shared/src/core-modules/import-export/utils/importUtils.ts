import ExcelJS from 'exceljs';
import { Readable } from 'stream';
import { parse as csvParse } from 'csv-parse';

/**
 * Stream a CSV file row by row.
 *
 * Memory usage is O(1 row) instead of O(file size): bytes flow from the
 * source stream (e.g. an S3 GetObject stream) through csv-parse, and each
 * row is yielded as soon as it is parsed.
 *
 * Error propagation: if the source stream errors mid-download (e.g. S3
 * connection drop) we destroy the csv-parse transform with the same error,
 * which causes the outer `for await` in the worker to throw. The import
 * job then correctly transitions to `failed` instead of silently finishing
 * with partial data or crashing the worker process.
 */
export async function* processCSVStream(
  input: Readable,
): AsyncGenerator<string[], void, unknown> {
  const parser = csvParse({
    bom: true, // strip UTF-8 BOM automatically
    relax_quotes: true, // tolerate loosely quoted fields
    skip_empty_lines: true,
    trim: true,
  });

  input.on('error', (err) => parser.destroy(err));
  input.pipe(parser);

  try {
    for await (const row of parser as AsyncIterable<string[]>) {
      yield row;
    }
  } finally {
    // If the consumer breaks out of the loop early, make sure both streams
    // are torn down so we don't leak sockets / file descriptors.
    if (!parser.destroyed) parser.destroy();
    if (!input.destroyed) input.destroy();
  }
}

/**
 * Stream an XLSX file row by row.
 *
 * Uses ExcelJS's streaming WorkbookReader so worksheet data is emitted
 * incrementally rather than buffering the whole workbook. The shared
 * strings table is cached in memory — for the 20MB upload cap this is
 * normally only a few hundred KB and keeps ordering safe regardless of
 * how the .xlsx archive lays out its parts.
 *
 * Note: ExcelJS's `row.values` is a 1-based array (index 0 is always
 * undefined), so we `slice(1)` to get a clean 0-based row.
 */
export async function* processXLSXStream(
  input: Readable,
): AsyncGenerator<string[], void, unknown> {
  // We capture source errors and re-throw them from the generator so the
  // worker's try/catch can mark the import as failed. ExcelJS does not
  // always forward source errors through its async iterator reliably.
  let sourceError: Error | null = null;
  input.on('error', (err) => {
    sourceError = err;
  });

  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(input, {
    entries: 'emit',
    sharedStrings: 'cache',
    worksheets: 'emit',
  });

  try {
    for await (const worksheet of workbook) {
      for await (const row of worksheet) {
        if (sourceError) throw sourceError;

        const raw = row.values as unknown[];
        // 1-based → 0-based; null/undefined become empty strings so
        // downstream column mapping stays aligned.
        const values = raw.slice(1).map((v) => (v == null ? '' : String(v)));

        yield values;
      }
    }

    // Final check in case the error arrived after the last row was read.
    if (sourceError) throw sourceError;
  } finally {
    if (!input.destroyed) input.destroy();
  }
}
