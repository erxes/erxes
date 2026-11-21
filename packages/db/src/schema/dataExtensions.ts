import {
  DATA_EXTENSION_FIELD_TYPES,
  DATA_EXTENSION_STATUSES,
  DATA_EXTENSION_TABLE_KINDS,
  type DATA_EXTENSION_ON_DELETE,
  type DATA_EXTENSION_OPTION_COLORS,
  type DATA_EXTENSION_RELATION_KINDS,
  type DATA_EXTENSION_RELATION_SIDES,
  type DATA_EXTENSION_VISIBLE_OPERATORS,
} from '../dataExtensionEnums';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  primaryKey,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

/**
 * Data Extensions' definitions: the objects and fields an organisation adds at runtime. The
 * records and values live in the organisation's own schema, `data_<org id>`, a table per
 * object or record type and a column per field, which `core_data_*` functions create
 * (drizzle/0087_data_extensions.sql).
 */

/** One choice of a select field: `value` is stored on records, `label` shown. */
export interface DataFieldOption {
  value: string;
  label: string;
  color: (typeof DATA_EXTENSION_OPTION_COLORS)[number];
}

/** A relation field: what it links to, and the field paired with it there. */
export interface DataFieldRelation {
  targetRecordType: string;
  kind: (typeof DATA_EXTENSION_RELATION_KINDS)[number];
  side: (typeof DATA_EXTENSION_RELATION_SIDES)[number];
  inverseFieldId: string;
  onDelete: (typeof DATA_EXTENSION_ON_DELETE)[number];
  /** A many-to-many's table of pairs (`rel_<id>`), the same on both sides. */
  pairsTable: string | null;
}

/** A JSON value, as a jsonb column holds it. */
export type DataJson = string | number | boolean | null | DataJson[] | { [key: string]: DataJson };

/** How a field behaves; the API checks each setting on every write. */
export interface DataFieldSettings {
  required?: boolean;
  unique?: boolean;
  defaultValue?: DataJson;
  min?: number;
  max?: number;
  maxLength?: number;
  scale?: number;
  currency?: string;
  precision?: number;
  multiple?: boolean;
  group?: string;
  showInCreate?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  visibleWhen?: {
    field: string;
    operator: (typeof DATA_EXTENSION_VISIBLE_OPERATORS)[number];
    value?: DataJson;
  };
}

/** A custom object: a record type of the organisation's own, `custom.<key>`. */
export const dataObjects = pgTable(
  'data_objects',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    key: text().notNull(),
    singularLabel: text().notNull(),
    pluralLabel: text().notNull(),
    description: text(),
    icon: text(),
    /** The text field whose value names a record. */
    labelFieldId: text(),
    status: text({ enum: DATA_EXTENSION_STATUSES }).notNull().default('active'),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_data_objects_org_key_key').on(table.orgId, table.key),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_data_objects_org_id_fkey',
    }).onDelete('cascade'),
    check('core_data_objects_status_check', inList(table.status, DATA_EXTENSION_STATUSES)),
  ],
);

/**
 * The table in the organisation's schema that holds a record type's values: a custom object's
 * records (`obj_<key>`), or a core or plugin record type's values (`ext_<plugin>_<type>`),
 * made when its first field is added.
 */
export const dataTables = pgTable(
  'data_tables',
  {
    orgId: orgIdColumn(),
    recordType: text().notNull(),
    tableName: text().notNull(),
    kind: text({ enum: DATA_EXTENSION_TABLE_KINDS }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.orgId, table.recordType], name: 'core_data_tables_pkey' }),
    uniqueIndex('core_data_tables_org_table_key').on(table.orgId, table.tableName),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_data_tables_org_id_fkey',
    }).onDelete('cascade'),
    check('core_data_tables_kind_check', inList(table.kind, DATA_EXTENSION_TABLE_KINDS)),
  ],
);

/** A field of a record type, and the column (or columns, `<column>_<part>`) it keeps. */
export const dataFields = pgTable(
  'data_fields',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    recordType: text().notNull(),
    key: text().notNull(),
    label: text().notNull(),
    description: text(),
    icon: text(),
    type: text({ enum: DATA_EXTENSION_FIELD_TYPES }).notNull(),
    /** The column, or the prefix of a composite type's columns; none for a relation's "one" side. */
    column: text(),
    options: jsonb().$type<DataFieldOption[]>().default([]).notNull(),
    relation: jsonb().$type<DataFieldRelation>(),
    settings: jsonb().$type<DataFieldSettings>().default({}).notNull(),
    position: integer().notNull().default(0),
    status: text({ enum: DATA_EXTENSION_STATUSES }).notNull().default('active'),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_data_fields_org_type_key_key').on(table.orgId, table.recordType, table.key),
    uniqueIndex('core_data_fields_org_type_column_key').on(
      table.orgId,
      table.recordType,
      table.column,
    ),
    index('core_data_fields_org_type_position_idx').on(
      table.orgId,
      table.recordType,
      table.position,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_data_fields_org_id_fkey',
    }).onDelete('cascade'),
    check('core_data_fields_type_check', inList(table.type, DATA_EXTENSION_FIELD_TYPES)),
    check('core_data_fields_status_check', inList(table.status, DATA_EXTENSION_STATUSES)),
  ],
);
