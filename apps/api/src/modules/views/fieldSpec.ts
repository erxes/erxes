import type { FilterField } from '@erxes/core-contract';
import type { StoredPluginRelation } from '@erxes/core-db';
import type { RELATION_MEASURES } from '@erxes/core-db/enums';
import type { FilterColumn } from '@erxes/plugin-sdk/filter';
import type { SQL } from 'drizzle-orm';

export type FieldType = FilterField['type'];

export type RelationMeasure = (typeof RELATION_MEASURES)[number];

export type RelationField = StoredPluginRelation['fields'][number];

/** A measure of a plugin's related records: what a `subject.related.…` path names. */
export interface RelatedSpec {
  plugin: string;
  relation: StoredPluginRelation;
  measure: RelationMeasure;
  /** The measured field (all but `count`). */
  field?: RelationField;
}

/** One filterable thing: how it reads in SQL for the list's table, compiled the way plugins compile theirs. */
export interface FieldSpec extends FilterField, Omit<FilterColumn, 'label' | 'expr'> {
  /** The value as SQL (for `tags`: unused; for `company.*`: over a row of `core_companies`). */
  expr: SQL;
  /** Fields of the linked company: checked inside "has a company where …". */
  viaCompany?: boolean;
  /** Rules name records (a lead stage, a category), the column holds ids: the names' ids as a `text[]`. */
  lookup?: (names: string[]) => SQL;
  /** A measure of a plugin's related records, read from its view. */
  related?: RelatedSpec;
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
