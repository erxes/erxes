import type { FilterField } from '@erxes/core-contract';
import type { FieldContentType } from '@erxes/core-db';
import type { FilterColumn } from '@erxes/plugin-sdk/filter';
import type { SQL } from 'drizzle-orm';

export type FieldType = FilterField['type'];

/** A custom field, filtered through its typed value rows. */
export interface CustomSpec {
  /** Whose values: the record's own, or (customers) the linked company's. */
  recordType: FieldContentType;
  fieldId: string;
  /** The value column. */
  storage: 'text' | 'number' | 'date' | 'bool';
}

/** One filterable thing: how it reads in SQL for the list's table, compiled the way plugins compile theirs. */
export interface FieldSpec extends FilterField, Omit<FilterColumn, 'label' | 'expr'> {
  /** The value as SQL (for `tags` and custom fields: unused; for `company.*`: a column of `core_companies`). */
  expr: SQL;
  custom?: CustomSpec;
  /** Fields of the linked company: checked inside "has a company where …". */
  viaCompany?: boolean;
  /** Rules name records (a lead stage, a category), the column holds ids: the names' ids as a `text[]`. */
  lookup?: (names: string[]) => SQL;
}

/** A built-in field of the list's record (`subject.<path>`). */
export const field = (
  path: string,
  label: string,
  type: FieldType,
  expr: SQL,
  extra: Partial<FieldSpec> = {},
): FieldSpec => ({
  path: `subject.${path}`,
  label,
  type,
  expr,
  group: 'fields',
  ...extra,
});
