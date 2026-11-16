import { ORG_UNIT_KINDS } from '../enums';
import { sql } from 'drizzle-orm';
import { check, foreignKey, index, primaryKey, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { users } from './users';

/**
 * Branches and departments, shared by every plugin: two trees in one table. Plugins keep a
 * read-only copy, refreshed from `core.unit.*` events, and hang their own settings on the ids.
 * Imported units keep old erxes' ids, so records that name them still match.
 */
export const orgUnits = pgTable(
  'org_units',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    kind: text({ enum: ORG_UNIT_KINDS }).notNull(),
    name: text().notNull(),
    /** The organisation's own code, unique per kind when set. */
    code: text(),
    /** A unit of the same kind this one sits under; null at the top. */
    parentId: text(),
    /** `/<root id>/…/<own id>/`: a subtree is every unit whose path starts with this one's. */
    path: text().notNull(),
    /** A member who leads the unit; plugins let them see its records and those under it. */
    supervisorId: text(),
    description: text(),
    // Contact details, as branches had in old erxes.
    address: text(),
    phone: text(),
    email: text(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // The target of the kind-checked foreign keys below.
    uniqueIndex('core_org_units_org_id_kind_key').on(table.orgId, table.id, table.kind),
    uniqueIndex('core_org_units_org_kind_code_key')
      .on(table.orgId, table.kind, sql`lower(${table.code})`)
      .where(sql`${table.code} IS NOT NULL`),
    index('core_org_units_org_kind_path_idx').on(
      table.orgId,
      table.kind,
      table.path.op('text_pattern_ops'),
    ),
    index('core_org_units_supervisor_idx')
      .on(table.supervisorId)
      .where(sql`${table.supervisorId} IS NOT NULL`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_org_units_org_id_fkey',
    }).onDelete('cascade'),
    // The parent is in the same organisation and of the same kind: a department never sits under a branch.
    foreignKey({
      columns: [table.orgId, table.parentId, table.kind],
      foreignColumns: [table.orgId, table.id, table.kind],
      name: 'core_org_units_parent_fkey',
    }),
    foreignKey({
      columns: [table.supervisorId],
      foreignColumns: [users.id],
      name: 'core_org_units_supervisor_id_fkey',
    }).onDelete('set null'),
    check('core_org_units_kind_check', inList(table.kind, ORG_UNIT_KINDS)),
    check('core_org_units_path_check', sql`${table.path} LIKE '%/' || ${table.id} || '/'`),
  ],
);

/** Who is in which unit. A member can be in several branches and departments. */
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
