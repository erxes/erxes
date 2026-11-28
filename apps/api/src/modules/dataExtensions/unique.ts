import { fail, pgCode, pgConstraint } from '~/http/errors';
import { columnsOf, uniqueIndexOf } from './columns';
import type { DataFieldRow } from './definitions';

/**
 * Runs a write to `table`, answering a unique field's violation as 409 TAKEN with the field
 * (`values.<key>`), as core's own unique columns answer.
 */
export const asTaken = async <T>(table: string, fields: DataFieldRow[], run: () => Promise<T>) => {
  try {
    return await run();
  } catch (error) {
    const constraint = pgConstraint(error);

    const field =
      pgCode(error) === '23505'
        ? fields.find((row) =>
            columnsOf(row).some((column) => uniqueIndexOf(table, column.name) === constraint),
          )
        : undefined;

    if (field) {
      throw fail('TAKEN', `Another record has this ${field.label}`, {
        field: `values.${field.key}`,
      });
    }

    throw error;
  }
};

/** Types a unique field may be: one plain value a record can be found by. */
export const UNIQUE_TYPES: ReadonlySet<string> = new Set([
  'text',
  'email',
  'phone',
  'url',
  'number',
]);
