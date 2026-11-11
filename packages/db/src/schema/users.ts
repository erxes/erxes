import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  foreignKey,
  index,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { organizations } from './organizations';

export const USER_STATUSES = ['invited', 'active', 'disabled'] as const;
export const USER_ROLES = ['owner', 'admin', 'member'] as const;

/** Team members of an organisation. */
export const users = pgTable(
  'users',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    email: text().notNull(),
    username: text(),
    fullName: text(),
    avatarUrl: text(),
    role: text({ enum: USER_ROLES }).default('member').notNull(),
    status: text({ enum: USER_STATUSES }).default('invited').notNull(),
    /** Set by the sign-in slice; never returned by the API. */
    passwordHash: text(),
    invitedBy: text(),
    isSupport: boolean().default(false).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('core_users_org_email_key').on(
      table.orgId,
      sql`lower(${table.email})`,
    ),
    index('core_users_org_status_idx').on(table.orgId, table.status),
    // Keyset paging, newest first.
    index('core_users_org_created_idx').on(
      table.orgId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_users_org_id_fkey',
    }).onDelete('cascade'),
    check(
      'core_users_role_check',
      sql`${table.role} IN ('owner', 'admin', 'member')`,
    ),
    check(
      'core_users_status_check',
      sql`${table.status} IN ('invited', 'active', 'disabled')`,
    ),
  ],
);
