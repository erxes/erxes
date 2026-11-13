import { CUSTOMER_CODE_PURPOSES, CUSTOMER_LOGIN_KINDS } from '../enums';
import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt } from './common';
import { customers } from './customers';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export type CustomerLoginKind = (typeof CUSTOMER_LOGIN_KINDS)[number];

/**
 * An email address or phone a customer proved with a code: they sign in with
 * it. One per address in an organisation (decision 42).
 */
export const customerLogins = pgTable(
  'customer_logins',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    customerId: text().notNull(),
    kind: text({ enum: CUSTOMER_LOGIN_KINDS }).notNull(),
    /** Normalised: lower-case email, phone without formatting. */
    value: text().notNull(),
    createdAt: createdAt(),
    lastUsedAt: timestamptz(),
  },
  (table) => [
    uniqueIndex('core_customer_logins_org_kind_value_key').on(table.orgId, table.kind, table.value),
    index('core_customer_logins_org_customer_idx').on(table.orgId, table.customerId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customer_logins_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: 'core_customer_logins_customer_id_fkey',
    }).onDelete('cascade'),
    check('core_customer_logins_kind_check', sql`${table.kind} IN ('email', 'phone')`),
  ],
);

/**
 * One-time sign-in codes: 6 digits, stored as an HMAC, valid 10 minutes and
 * for 5 tries. Kept after use, so sending is limited per address.
 */
export const customerCodes = pgTable(
  'customer_codes',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    kind: text({ enum: CUSTOMER_LOGIN_KINDS }).notNull(),
    value: text().notNull(),
    purpose: text({ enum: CUSTOMER_CODE_PURPOSES }).notNull(),
    /** `add_login`: the signed-in customer the address will belong to. */
    customerId: text(),
    codeHash: text().notNull(),
    attempts: integer().default(0).notNull(),
    ip: text(),
    expiresAt: timestamptz().notNull(),
    usedAt: timestamptz(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_customer_codes_org_address_idx').on(
      table.orgId,
      table.kind,
      table.value,
      table.createdAt.desc(),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customer_codes_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: 'core_customer_codes_customer_id_fkey',
    }).onDelete('cascade'),
    check('core_customer_codes_kind_check', sql`${table.kind} IN ('email', 'phone')`),
    check('core_customer_codes_purpose_check', sql`${table.purpose} IN ('sign_in', 'add_login')`),
  ],
);

/**
 * A customer signed in to a plugin's app, held as a refresh token. The token
 * rotates on every use; the previous one is kept, so using it again (it
 * leaked) ends the session.
 */
export const customerSessions = pgTable(
  'customer_sessions',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    customerId: text().notNull(),
    /** The plugin whose app holds it. */
    clientId: text().notNull(),
    tokenHash: text().notNull(),
    previousTokenHash: text(),
    userAgent: text(),
    ip: text(),
    createdAt: createdAt(),
    lastUsedAt: timestamptz().defaultNow().notNull(),
    expiresAt: timestamptz().notNull(),
    revokedAt: timestamptz(),
  },
  (table) => [
    index('core_customer_sessions_org_customer_idx').on(table.orgId, table.customerId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customer_sessions_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: 'core_customer_sessions_customer_id_fkey',
    }).onDelete('cascade'),
  ],
);
