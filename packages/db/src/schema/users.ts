import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
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
    /** Display name; kept in step with first/middle/last name. */
    fullName: text(),
    avatarUrl: text(),
    // Profile details, as old erxes `users.details`.
    firstName: text(),
    middleName: text(),
    lastName: text(),
    shortName: text(),
    employeeId: text(),
    phone: text(),
    birthDate: date({ mode: 'string' }),
    workStartedDate: date({ mode: 'string' }),
    description: text(),
    /** Social links by name (facebook, website, …). */
    links: jsonb().$type<Record<string, string>>().default({}).notNull(),
    role: text({ enum: USER_ROLES }).default('member').notNull(),
    status: text({ enum: USER_STATUSES }).default('invited').notNull(),
    /** Set by the sign-in slice; never returned by the API. */
    passwordHash: text(),
    /**
     * Sessions carry this number; raising it (password change or reset,
     * disable, enable, "sign out everywhere") ends every session issued before.
     */
    sessionVersion: integer().default(1).notNull(),
    invitedBy: text(),
    isSupport: boolean().default(false).notNull(),
    /**
     * The member's notification choices: `muted` lists kinds
     * (`core.customer.updated`) or whole sources (`hr`) they don't want.
     */
    notificationSettings: jsonb().$type<{ muted?: string[] }>().default({}).notNull(),
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
