import type { FIELD_LOGIC_ACTIONS, FIELD_LOGIC_OPERATORS } from '../enums';
import { FIELD_CONTENT_TYPES, FIELD_TYPES, FIELD_VALIDATIONS, PLUGIN_RECORD_TYPE } from '../enums';
import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, inListOrMatch, orgIdColumn, pgTable } from '../table';
import { createdAt, type PropertyContentType, updatedAt } from './common';
import { organizations } from './organizations';
import { plugins } from './plugins';

/** A field shown or hidden by other fields' values, each rule naming a field of the same type. */
export type FieldLogic = {
  action: (typeof FIELD_LOGIC_ACTIONS)[number];
  rules: {
    fieldId: string;
    operator: (typeof FIELD_LOGIC_OPERATORS)[number];
    /** What `is`, `isNot`, `contains`, `greaterThan` and `lessThan` compare with. */
    value: string | null;
  }[];
};

/** One of core's records (`FIELD_CONTENT_TYPES`) or a plugin's, `<plugin>.<type>`. */
const propertyContentType = (column: AnyPgColumn) =>
  inListOrMatch(column, FIELD_CONTENT_TYPES, PLUGIN_RECORD_TYPE);

/**
 * Groups that properties of a record type are organised in (old erxes field
 * groups). Archiving a group hides it and its fields; values stay.
 */
export const fieldGroups = pgTable(
  'field_groups',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    contentType: text().$type<PropertyContentType>().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    description: text(),
    order: integer().default(0).notNull(),
    /**
     * The records of a plugin's type the group shows on, by what the plugin's UI config names
     * (`{ team: [id], project: [id] }`): a record must be in each listed key. Empty: every record.
     */
    appliesTo: jsonb().$type<Record<string, string[]>>().default({}).notNull(),
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
    check('core_field_groups_content_type_check', propertyContentType(table.contentType)),
  ],
);

/**
 * Custom fields ("properties") an organisation adds to customers, companies,
 * products or a plugin's record type. Core's records keep values in
 * core_<type>_field_values; a plugin keeps its records' values itself.
 */
export const fields = pgTable(
  'fields',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    contentType: text().$type<PropertyContentType>().notNull(),
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
    /** A record can't be made without a value, nor have it cleared, while the field shows. */
    isRequired: boolean().default(false).notNull(),
    /** Asked for on the form that makes a record, not only on the record once made. */
    isVisibleToCreate: boolean().default(true).notNull(),
    /** Shows or hides the field by other fields' values: every rule must match. Null: always shown. */
    logic: jsonb().$type<FieldLogic>(),
    /** Listed in list filters; a plugin's rollup a relation filters by better is a column only. */
    filterable: boolean().default(true).notNull(),
    order: integer().default(0).notNull(),
    /**
     * The plugin that declared it in its manifest and writes its values; members only read it.
     * Null: a member made it.
     */
    plugin: text(),
    archivedAt: timestamp({ withTimezone: true, mode: 'date' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // Members' labels and codes are unique among members' fields; a plugin's codes among its own.
    uniqueIndex('core_fields_org_type_label_key')
      .on(table.orgId, table.contentType, sql`lower(${table.label})`)
      .where(sql`${table.plugin} IS NULL`),
    uniqueIndex('core_fields_org_type_code_key')
      .on(table.orgId, table.contentType, sql`lower(${table.code})`)
      .where(sql`${table.code} IS NOT NULL AND ${table.plugin} IS NULL`),
    uniqueIndex('core_fields_org_type_plugin_code_key')
      .on(table.orgId, table.contentType, table.plugin, table.code)
      .where(sql`${table.plugin} IS NOT NULL`),
    index('core_fields_plugin_idx')
      .on(table.plugin)
      .where(sql`${table.plugin} IS NOT NULL`),
    index('core_fields_org_type_idx').on(table.orgId, table.contentType, table.order),
    index('core_fields_group_id_idx').on(table.groupId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_fields_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.plugin],
      foreignColumns: [plugins.name],
      name: 'core_fields_plugin_fkey',
    }).onDelete('cascade'),
    check(
      'core_fields_plugin_code_check',
      sql`${table.plugin} IS NULL OR ${table.code} IS NOT NULL`,
    ),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [fieldGroups.id],
      name: 'core_fields_group_id_fkey',
    }).onDelete('set null'),
    check('core_fields_content_type_check', propertyContentType(table.contentType)),
    check('core_fields_type_check', inList(table.type, FIELD_TYPES)),
    check(
      'core_fields_validation_check',
      sql`${table.validation} IS NULL OR ${inList(table.validation, FIELD_VALIDATIONS)}`,
    ),
  ],
);
