import { type NOTIFICATION_DELIVERIES, USER_STATUSES } from '../enums';
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
import { inList, orgIdColumn, pgTable } from '../table';
import { organizations } from './organizations';

/**
 * Roles of an organisation: named sets of permissions (`contacts.delete`,
 * `hr.leave.approve`). Built in: `owner` (everything, including owner-only
 * actions), `admin` (`*`: everything but owner-only) and `member` (editable).
 * Custom roles have keys `r_<id>`.
 */
export const roles = pgTable(
  'roles',
  {
    orgId: orgIdColumn(),
    key: text().notNull(),
    name: text().notNull(),
    description: text(),
    /** Permission actions; `*` means every grantable one. */
    permissions: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
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
    orgId: orgIdColumn(),
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
    /** Two-factor sign-in (TOTP): the sealed secret, set once confirmed with a code. */
    totpSecretSealed: text(),
    /** A secret being set up, until the member confirms it with a code. */
    totpPendingSealed: text(),
    totpEnabledAt: timestamp({ withTimezone: true, mode: 'date' }),
    /** The last 30-second step a code was accepted for: a code works once. */
    totpLastStep: integer(),
    /** SHA-256 hashes of unused recovery codes. */
    recoveryCodes: text().array(),
    invitedBy: text(),
    isSupport: boolean().default(false).notNull(),
    /**
     * The member's notification choices: `muted` lists kinds
     * (`core.customer.updated`) or whole sources (`hr`) they don't want.
     */
    notificationSettings: jsonb()
      .$type<{
        muted?: string[];
        groups?: Record<string, (typeof NOTIFICATION_DELIVERIES)[number]>;
        email?: boolean;
        browser?: boolean;
      }>()
      .default({})
      .notNull(),
    /** Finished the welcome steps (any browser); null shows them at the next sign-in. */
    onboardedAt: timestamp({ withTimezone: true, mode: 'date' }),
    createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    // Sign-in finds a member by email before the organisation is known.
    index('core_users_email_idx').on(sql`lower(${table.email})`),
    uniqueIndex('core_users_org_email_key').on(table.orgId, sql`lower(${table.email})`),
    index('core_users_org_status_idx').on(table.orgId, table.status),
    // Keyset paging, newest first.
    index('core_users_org_created_idx').on(table.orgId, table.createdAt.desc(), table.id.desc()),
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
    check('core_users_status_check', inList(table.status, USER_STATUSES)),
  ],
);
