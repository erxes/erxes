import { FIELD_CONTENT_TYPES, FIELD_TYPES, FIELD_VALIDATIONS } from '../enums';
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

/**
 * Groups that properties of a record type are organised in (old erxes field
 * groups). Archiving a group hides it and its fields; values stay.
 */
export const fieldGroups = pgTable(
  'field_groups',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    contentType: text({ enum: FIELD_CONTENT_TYPES }).notNull(),
    name: text().notNull(),
    code: text().notNull(),
    description: text(),
    order: integer().default(0).notNull(),
    archivedAt: timestamp({ withTimezone: true, mode: 'date' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_field_groups_org_type_code_key').on(
      table.orgId,
      table.contentType,
      sql`lower(${table.code})`,
    ),
    index('core_field_groups_org_type_idx').on(table.orgId, table.contentType, table.order),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_field_groups_org_id_fkey',
    }).onDelete('cascade'),
    check(
      'core_field_groups_content_type_check',
      sql`${table.contentType} IN ('customer', 'company', 'product')`,
    ),
  ],
);

/**
 * Custom fields ("properties") an organisation adds to customers, companies
 * or products. Values live in core_<type>_field_values.
 */
export const fields = pgTable(
  'fields',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    contentType: text({ enum: FIELD_CONTENT_TYPES }).notNull(),
    /** The group it is listed in; fields made before groups have none. */
    groupId: text(),
    label: text().notNull(),
    /** A stable key for integrations (old erxes `code`). */
    code: text(),
    description: text(),
    /** A Tabler icon name. */
    icon: text(),
    type: text({ enum: FIELD_TYPES }).notNull(),
    /** Format text values must have. */
    validation: text({ enum: FIELD_VALIDATIONS }),
    /** Choices for select / multiselect / radio / check. */
    options: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** Shown where records show (table columns, record panel). */
    isVisible: boolean().default(true).notNull(),
    order: integer().default(0).notNull(),
    archivedAt: timestamp({ withTimezone: true, mode: 'date' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_fields_org_type_label_key').on(
      table.orgId,
      table.contentType,
      sql`lower(${table.label})`,
    ),
    uniqueIndex('core_fields_org_type_code_key')
      .on(table.orgId, table.contentType, sql`lower(${table.code})`)
      .where(sql`${table.code} IS NOT NULL`),
    index('core_fields_org_type_idx').on(table.orgId, table.contentType, table.order),
    index('core_fields_group_id_idx').on(table.groupId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_fields_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [fieldGroups.id],
      name: 'core_fields_group_id_fkey',
    }).onDelete('set null'),
    check(
      'core_fields_content_type_check',
      sql`${table.contentType} IN ('customer', 'company', 'product')`,
    ),
    check(
      'core_fields_type_check',
      sql`${table.type} IN ('text', 'textarea', 'number', 'date', 'boolean', 'select', 'multiselect', 'radio', 'check', 'phone', 'list')`,
    ),
    check(
      'core_fields_validation_check',
      sql`${table.validation} IS NULL OR ${table.validation} IN ('number', 'email', 'date')`,
    ),
  ],
);
