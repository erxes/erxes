import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { organizations } from './organizations';

export const USER_STATUSES = ['invited', 'active', 'disabled'] as const;
/** The built-in roles every organisation has. */
export const USER_ROLES = ['owner', 'admin', 'member'] as const;

/**
 * Roles of an organisation: named sets of permissions (`contacts.delete`,
 * `hr.leave.approve`). Built in: `owner` (everything, including owner-only
 * actions), `admin` (`*`: everything but owner-only) and `member` (editable).
 * Custom roles have keys `r_<id>`.
 */
export const roles = pgTable(
  'roles',
  {
    orgId: text().notNull(),
    key: text().notNull(),
    name: text().notNull(),
    description: text(),
    /** Permission actions; `*` means every grantable one. */
    permissions: text().array().default(sql`'{}'::text[]`).notNull(),
    builtin: boolean().default(false).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.orgId, table.key], name: 'core_roles_pkey' }),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_roles_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

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
    /** The member's role (`core_roles.key` in the organisation): owner, admin, member or a custom one. */
    role: text().default('member').notNull(),
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
    foreignKey({
      columns: [table.orgId, table.role],
      foreignColumns: [roles.orgId, roles.key],
      name: 'core_users_role_fkey',
    }),
    check(
      'core_users_status_check',
      sql`${table.status} IN ('invited', 'active', 'disabled')`,
    ),
  ],
);
