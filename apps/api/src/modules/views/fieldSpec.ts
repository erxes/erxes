import type { FilterField } from '@erxes/core-contract';
import type { FieldContentType } from '@erxes/core-db';
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

/** One filterable thing: how it reads in SQL for the list's table. */
export interface FieldSpec extends FilterField {
  /** The value as SQL (for `tags` and custom fields: unused; for `company.*`: a column of `core_companies`). */
  expr: SQL;
  custom?: CustomSpec;
  /** Only a day, no time (dates compare as dates so their indexes apply). */
  dateOnly?: boolean;
  /** Text with a trigram index: "is" is an ILIKE without wildcards so the index serves it. */
  trigram?: boolean;
  /** Birthday: "anniversary within" reads this stored month * 100 + day column. */
  monthDay?: SQL;
  /** Fields of the linked company: checked inside "has a company where …". */
  viaCompany?: boolean;
  /** Rules name records (a lead stage, a category), the column holds ids: the names' ids as a `text[]`. */
  lookup?: (names: string[]) => SQL;
  /** A `text[]` column (the plugins using a product): "is" means "has". */
  array?: boolean;
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
