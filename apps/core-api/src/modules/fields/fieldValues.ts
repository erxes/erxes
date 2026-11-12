import {
  companyFieldValues,
  type ContentType,
  customerFieldValues,
  type CustomValue,
  type Db,
  fields,
} from '@erxes/core-db';
import { and, Column, eq, getTableName, inArray, is, type SQL, sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

/**
 * Custom field values live in typed rows (core_customer_field_values,
 * core_company_field_values): text, number, date or yes/no each in its own
 * indexed column, multi-choice fields one row per choice. Records still read
 * and write them as `{ [fieldId]: value }`; this is the translation.
 */
export const valuesTable = (type: ContentType) =>
  type === 'customer' ? customerFieldValues : companyFieldValues;

/** Field types holding several values (one row each, in order). */
export const LIST_FIELD_TYPES = ['multiselect', 'check', 'list'] as const;

const LIST_TYPES_SQL = sql.raw(`(${LIST_FIELD_TYPES.map((type) => `'${type}'`).join(', ')})`);

/**
 * A record's values as one JSON object (`{ fieldId: value }`), for a select:
 * one index lookup per record, so fine for pages and exports alike.
 */
export const customFieldsColumn = (type: ContentType, recordId: PgColumn | SQL) => {
  // Drizzle leaves columns unqualified in select lists: every name here is spelled out.
  const outer = is(recordId, Column)
    ? sql`${sql.identifier(getTableName(recordId.table))}.${sql.identifier(recordId.name)}`
    : recordId;

  return sql<Record<string, CustomValue>>`coalesce((
    select jsonb_object_agg(x.field_id, x.value) from (
      select fv.field_id,
        case when f.type in ${LIST_TYPES_SQL}
          then jsonb_agg(to_jsonb(fv.text_value) order by fv.position)
          else (array_agg(coalesce(to_jsonb(fv.text_value), to_jsonb(fv.number_value), to_jsonb(fv.date_value), to_jsonb(fv.bool_value))))[1]
        end as value
      from ${sql.identifier(getTableName(valuesTable(type)))} fv join ${sql.identifier(getTableName(fields))} f on f.id = fv.field_id
      where fv.record_id = ${outer}
      group by fv.field_id, f.type
    ) x
  ), '{}'::jsonb)`;
};

type Row = typeof customerFieldValues.$inferInsert;

/** The stored rows of one value of a field. */
const rowsOf = (
  base: Pick<Row, 'orgId' | 'recordId' | 'fieldId'>,
  fieldType: string,
  value: CustomValue,
): Row[] => {
  if (Array.isArray(value))
    return value.map((item, position) => ({ ...base, position, textValue: item }));

  switch (fieldType) {
    case 'number':
      return [{ ...base, numberValue: Number(value) }];
    case 'date':
      return [{ ...base, dateValue: String(value) }];
    case 'boolean':
      return [{ ...base, boolValue: Boolean(value) }];
    default:
      return [{ ...base, textValue: String(value) }];
  }
};

/**
 * Stores a record's values of `fieldIds` as in `values` (missing: cleared).
 * Values must already be checked (`applyCustomFields`).
 */
export const saveCustomFields = async (
  tx: Db,
  orgId: string,
  type: ContentType,
  recordId: string,
  values: Record<string, CustomValue>,
  fieldIds: string[],
) => {
  if (!fieldIds.length) return;

  const table = valuesTable(type);

  await tx.delete(table).where(and(eq(table.recordId, recordId), inArray(table.fieldId, fieldIds)));

  const present = fieldIds.filter((id) => values[id] !== undefined);

  if (!present.length) return;

  const types = new Map(
    (
      await tx
        .select({ id: fields.id, type: fields.type })
        .from(fields)
        .where(and(eq(fields.orgId, orgId), inArray(fields.id, present)))
    ).map((field) => [field.id, field.type]),
  );

  const rows = present.flatMap((fieldId) => {
    const fieldType = types.get(fieldId);
    const value = values[fieldId];

    return fieldType && value !== undefined
      ? rowsOf({ orgId, recordId, fieldId }, fieldType, value)
      : [];
  });

  if (rows.length) await tx.insert(table).values(rows);
};
