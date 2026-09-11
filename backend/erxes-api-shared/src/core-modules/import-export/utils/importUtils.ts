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
 * Count the data rows of a CSV file (header excluded).
 *
 * The worker needs a real denominator before it starts: without it,
 * progress is computed against "rows read so far", which makes the bar
 * jump backwards on every batch and pins the ETA near zero. Counting is a
 * separate streaming pass — it never holds more than one row in memory.
 */
export async function countCsvDataRows(input: Readable): Promise<number> {
  const rowIterator = processCSVStream(input);
  let rows = 0;

  while (!(await rowIterator.next()).done) {
    rows++;
  }

  return Math.max(rows - 1, 0);
}
