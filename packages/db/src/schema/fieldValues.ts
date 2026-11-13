import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  doublePrecision,
  foreignKey,
  index,
  primaryKey,
  smallint,
  text,
} from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { companies } from './companies';
import { customers } from './customers';
import { fields } from './fields';
import { organizations } from './organizations';
import { products } from './products';

/**
 * Custom field ("property") values: one row per value, in a column of its
 * type, so every filter on a property is an index lookup (number ranges,
 * dates, a choice, text that contains …) rather than a scan of every record.
 * Multi-choice and list fields have one row per item (`position` keeps their
 * order). One table per record type so the record side has a real foreign
 * key: deleting a record, or a field, removes its values.
 */
const RECORDS = {
  customer_field_values: customers,
  company_field_values: companies,
  product_field_values: products,
};

const fieldValues = (name: keyof typeof RECORDS) => {
  const records = RECORDS[name];
  const t = `core_${name}`;

  return pgTable(
    name,
    {
      orgId: orgIdColumn(),
      recordId: text().notNull(),
      fieldId: text().notNull(),
      position: smallint().default(0).notNull(),
      /** text, textarea, phone, select, radio; each item of multiselect, check, list. */
      textValue: text(),
      numberValue: doublePrecision(),
      dateValue: date({ mode: 'string' }),
      boolValue: boolean(),
    },
    (table) => [
      // Reading a record's values; "has a value" checks per record.
      primaryKey({ columns: [table.recordId, table.fieldId, table.position], name: `${t}_pkey` }),
      // Deleting a field; usage counts.
      index(`${t}_field_idx`).on(table.fieldId, table.recordId),
      index(`${t}_text_idx`)
        .on(table.orgId, table.fieldId, sql`lower(${table.textValue})`)
        .where(sql`${table.textValue} IS NOT NULL`),
      // "contains" / "starts with" on text.
      index(`${t}_text_trgm_idx`).using('gin', table.textValue.op('gin_trgm_ops')),
      index(`${t}_number_idx`)
        .on(table.orgId, table.fieldId, table.numberValue)
        .where(sql`${table.numberValue} IS NOT NULL`),
      index(`${t}_date_idx`)
        .on(table.orgId, table.fieldId, table.dateValue)
        .where(sql`${table.dateValue} IS NOT NULL`),
      // Anniversaries ("within the next 7 days, any year"): month * 100 + day.
      index(`${t}_month_day_idx`)
        .on(
          table.orgId,
          table.fieldId,
          sql`((extract(month from ${table.dateValue}) * 100 + extract(day from ${table.dateValue}))::smallint)`,
        )
        .where(sql`${table.dateValue} IS NOT NULL`),
      index(`${t}_bool_idx`)
        .on(table.orgId, table.fieldId, table.boolValue)
        .where(sql`${table.boolValue} IS NOT NULL`),
      foreignKey({
        columns: [table.recordId],
        foreignColumns: [records.id],
        name: `${t}_record_id_fkey`,
      }).onDelete('cascade'),
      foreignKey({
        columns: [table.fieldId],
        foreignColumns: [fields.id],
        name: `${t}_field_id_fkey`,
      }).onDelete('cascade'),
      foreignKey({
        columns: [table.orgId],
        foreignColumns: [organizations.id],
        name: `${t}_org_id_fkey`,
      }).onDelete('cascade'),
      check(
        `${t}_one_value_check`,
        sql`num_nonnulls(${table.textValue}, ${table.numberValue}, ${table.dateValue}, ${table.boolValue}) = 1`,
      ),
    ],
  );
};

export const customerFieldValues = fieldValues('customer_field_values');
export const companyFieldValues = fieldValues('company_field_values');
export const productFieldValues = fieldValues('product_field_values');
