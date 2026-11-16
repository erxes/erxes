import { sql } from 'drizzle-orm';
import { check, foreignKey, integer, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { organizations } from './organizations';
import { users } from './users';

/**
 * A member's starred page: where it is in web (path and query, so a saved view
 * or an open record comes back too) and what to call it. Only its member sees it.
 */
export const favorites = pgTable(
  'favorites',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    userId: text().notNull(),
    /** A web address from its first slash: `/contacts?view=…`. */
    path: text().notNull(),
    label: text().notNull(),
    /** Its place in the member's list, from 1. */
    position: integer().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('core_favorites_org_user_path_key').on(table.orgId, table.userId, table.path),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_favorites_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'core_favorites_user_id_fkey',
    }).onDelete('cascade'),
    check('core_favorites_path_check', sql`${table.path} ~ '^/[^/\\s]'`),
  ],
);
