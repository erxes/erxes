import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { users } from './users';

/**
 * The kinds of unit an organisation uses (branch, department, store, team), and where each may
 * sit: right under the organisation (`canBeRoot`) and under which types (`allowedParentTypeIds`,
 * empty for any). Every organisation starts with a Branch and a Department type and keeps an
 * active one of its own. A type with `plugin` comes from that plugin's manifest: members can't
 * change or delete it, so the plugin can rely on it.
 */
export const orgUnitTypes = pgTable(
  'org_unit_types',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    name: text().notNull(),
    /** The organisation's own code, unique among its own types; a plugin's is from its manifest. */
    code: text(),
    description: text(),
    /** `#rrggbb` */
    color: text().default('#64748b').notNull(),
    /** A Tabler icon name (`IconBuilding`). */
    icon: text(),

    canBeRoot: boolean().default(true).notNull(),
    allowedParentTypeIds: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** Inactive types stay on their units but aren't given to new ones. */
    isActive: boolean().default(true).notNull(),
    /** The first active type that fits is the one a unit gets when none is named. */
    sortOrder: integer().default(0).notNull(),

    plugin: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // The target of the units' type key.
    uniqueIndex('core_org_unit_types_org_id_id_key').on(table.orgId, table.id),
    uniqueIndex('core_org_unit_types_org_code_key')
      .on(table.orgId, sql`lower(${table.code})`)
      .where(sql`${table.code} IS NOT NULL AND ${table.plugin} IS NULL`),
    uniqueIndex('core_org_unit_types_org_plugin_code_key')
      .on(table.orgId, table.plugin, table.code)
      .where(sql`${table.plugin} IS NOT NULL`),
    index('core_org_unit_types_org_order_idx').on(table.orgId, table.sortOrder),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_org_unit_types_org_id_fkey',
    }).onDelete('cascade'),
    check(
      'core_org_unit_types_plugin_code_check',
      sql`${table.plugin} IS NULL OR ${table.code} IS NOT NULL`,
    ),
  ],
);

/**
 * The organisation's structure, shared by every plugin: one tree. Its top is the organisation
 * itself, a unit without a parent or a type that every organisation has from the start and that
 * can't be moved or deleted. Plugins keep a read-only copy, refreshed from `core.unit.*` events,
 * and hang their own settings on the ids. Imported units keep old erxes' ids, so records that
 * name them still match.
 */
export const orgUnits = pgTable(
  'org_units',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** One of the organisation's unit types; null only for the top unit. */
    typeId: text(),
    name: text().notNull(),
    /** The organisation's own code, unique when set. */
    code: text(),
    /** The unit this one sits under; null only for the top unit. */
    parentId: text(),
    /**
     * `/<top id>/…/<own id>/`: a subtree is every unit whose path starts with this one's.
     * `core_units_under` reads subtrees from it.
     */
    path: text().notNull(),
    /** A member who leads the unit; plugins let them see its records and those under it. */
    supervisorId: text(),
    description: text(),
    // Contact details, as branches had in old erxes.
    address: text(),
    phone: text(),
    email: text(),

    isActive: boolean().default(true).notNull(),

    sortOrder: integer().default(0).notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // The target of the parent key below.
    uniqueIndex('core_org_units_org_id_id_key').on(table.orgId, table.id),
    uniqueIndex('core_org_units_org_code_key')
      .on(table.orgId, sql`lower(${table.code})`)
      .where(sql`${table.code} IS NOT NULL`),

    uniqueIndex('core_org_units_org_root_key')
      .on(table.orgId)
      .where(sql`${table.parentId} IS NULL`),
    index('core_org_units_org_path_idx').on(table.orgId, table.path.op('text_pattern_ops')),

    index('core_org_units_org_parent_order_idx').on(
      table.orgId,
      table.parentId,
      table.sortOrder,
      table.name,
      table.id,
    ),
    index('core_org_units_supervisor_idx')
      .on(table.supervisorId)
      .where(sql`${table.supervisorId} IS NOT NULL`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_org_units_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId, table.parentId],
      foreignColumns: [table.orgId, table.id],
      name: 'core_org_units_parent_fkey',
    }),
    foreignKey({
      columns: [table.orgId, table.typeId],
      foreignColumns: [orgUnitTypes.orgId, orgUnitTypes.id],
      name: 'core_org_units_type_fkey',
    }),
    index('core_org_units_org_type_idx').on(table.orgId, table.typeId),
    foreignKey({
      columns: [table.supervisorId],
      foreignColumns: [users.id],
      name: 'core_org_units_supervisor_id_fkey',
    }).onDelete('set null'),
    check('core_org_units_path_check', sql`${table.path} LIKE '%/' || ${table.id} || '/'`),
    check('core_org_units_id_check', sql`position('/' in ${table.id}) = 0`),
    check(
      'core_org_units_root_check',
      sql`(${table.parentId} IS NULL) = (${table.typeId} IS NULL)`,
    ),
  ],
);

/** Who is in which unit. A member can be in several. */
export const orgUnitMembers = pgTable(
  'org_unit_members',
  {
    orgId: orgIdColumn(),
    unitId: text().notNull(),
    userId: text().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.unitId, table.userId], name: 'core_org_unit_members_pkey' }),
    index('core_org_unit_members_org_user_idx').on(table.orgId, table.userId),
    foreignKey({
      columns: [table.unitId],
      foreignColumns: [orgUnits.id],
      name: 'core_org_unit_members_unit_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'core_org_unit_members_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_org_unit_members_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const orgUnitTombstones = pgTable(
  'org_unit_tombstones',
  {
    orgId: orgIdColumn(),
    id: text().notNull(),
    deletedAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.orgId, table.id], name: 'core_org_unit_tombstones_pkey' }),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_org_unit_tombstones_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
