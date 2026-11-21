import { sql } from 'drizzle-orm';
import {
  foreignKey,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

/**
 * Sections a record type's Data Extensions fields show under. Archiving a group hides it and
 * its fields; their values stay.
 */
export const dataFieldGroups = pgTable(
  'data_field_groups',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    recordType: text().notNull(),
    label: text().notNull(),
    /** A stable name for integrations and imports, unique per record type. */
    code: text().notNull(),
    description: text(),
    position: integer().notNull().default(0),
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
    uniqueIndex('core_data_field_groups_org_type_code_key').on(
      table.orgId,
      table.recordType,
      sql`lower(${table.code})`,
    ),
    index('core_data_field_groups_org_type_position_idx').on(
      table.orgId,
      table.recordType,
      table.position,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_data_field_groups_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
