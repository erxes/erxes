import { sql } from 'drizzle-orm';
import { check, foreignKey, index, integer, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { CONTENT_TYPES, createdAt, updatedAt } from './common';
import { organizations } from './organizations';

export const FIELD_TYPES = ['text', 'textarea', 'number', 'date', 'boolean', 'select', 'multiselect'] as const;

/**
 * Custom fields ("properties") an organisation adds to customers or companies.
 * Values live in the record's `custom_fields` JSON, keyed by field id.
 */
export const fields = pgTable(
  'fields',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    contentType: text({ enum: CONTENT_TYPES }).notNull(),
    label: text().notNull(),
    type: text({ enum: FIELD_TYPES }).notNull(),
    /** Choices for select / multiselect. */
    options: text().array().default(sql`'{}'::text[]`).notNull(),
    order: integer().default(0).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_fields_org_type_label_key').on(
      table.orgId,
      table.contentType,
      sql`lower(${table.label})`,
    ),
    index('core_fields_org_type_idx').on(table.orgId, table.contentType, table.order),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_fields_org_id_fkey',
    }).onDelete('cascade'),
    check('core_fields_content_type_check', sql`${table.contentType} IN ('customer', 'company')`),
    check(
      'core_fields_type_check',
      sql`${table.type} IN ('text', 'textarea', 'number', 'date', 'boolean', 'select', 'multiselect')`,
    ),
  ],
);
