import { CUSTOMER_ACCOUNT_STATUSES, CUSTOMER_CODE_PURPOSES, CUSTOMER_LOGIN_KINDS } from '../enums';
import {
  check,
  foreignKey,
  index,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { customers } from './customers';
import { organizations } from './organizations';
import { websites } from './websites';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export type CustomerLoginKind = (typeof CUSTOMER_LOGIN_KINDS)[number];

export type CustomerAccountStatus = (typeof CUSTOMER_ACCOUNT_STATUSES)[number];

/**
 * A customer's sign-up on one website (decision 42). The same person on two
 * websites is one customer with two accounts, each with its own logins and sessions.
 */
export const customerAccounts = pgTable(
  'customer_accounts',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    websiteId: text().notNull(),
    customerId: text().notNull(),
    status: text({ enum: CUSTOMER_ACCOUNT_STATUSES }).default('active').notNull(),
    createdAt: createdAt(),
    lastSignedInAt: timestamptz(),
  },
  (table) => [
    uniqueIndex('core_customer_accounts_org_website_customer_key').on(
      table.orgId,
      table.websiteId,
      table.customerId,
    ),
    // Logins and sessions name the account and its website together.
    uniqueIndex('core_customer_accounts_id_website_key').on(table.id, table.websiteId),
    index('core_customer_accounts_org_customer_idx').on(table.orgId, table.customerId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customer_accounts_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.websiteId],
      foreignColumns: [websites.id],
      name: 'core_customer_accounts_website_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: 'core_customer_accounts_customer_id_fkey',
    }).onDelete('cascade'),
    check('core_customer_accounts_status_check', inList(table.status, CUSTOMER_ACCOUNT_STATUSES)),
  ],
);

/**
 * An email address or phone an account proved with a code: it signs in with
 * it. One per address on a website.
 */
export const customerLogins = pgTable(
  'customer_logins',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    accountId: text().notNull(),
    websiteId: text().notNull(),
    kind: text({ enum: CUSTOMER_LOGIN_KINDS }).notNull(),
    /** Normalised: lower-case email, phone without formatting. */
    value: text().notNull(),
    createdAt: createdAt(),
    lastUsedAt: timestamptz(),
  },
  (table) => [
    uniqueIndex('core_customer_logins_org_website_kind_value_key').on(
      table.orgId,
      table.websiteId,
      table.kind,
      table.value,
    ),
    index('core_customer_logins_org_account_idx').on(table.orgId, table.accountId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customer_logins_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.accountId, table.websiteId],
      foreignColumns: [customerAccounts.id, customerAccounts.websiteId],
      name: 'core_customer_logins_account_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    check('core_customer_logins_kind_check', inList(table.kind, CUSTOMER_LOGIN_KINDS)),
  ],
);

/**
 * One-time sign-in codes for a website: 6 digits, stored as an HMAC, valid 10
 * minutes and for 5 tries. Kept after use, so sending is limited per address.
 */
export const customerCodes = pgTable(
  'customer_codes',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    websiteId: text().notNull(),
    kind: text({ enum: CUSTOMER_LOGIN_KINDS }).notNull(),
    value: text().notNull(),
    purpose: text({ enum: CUSTOMER_CODE_PURPOSES }).notNull(),
    /** `add_login`: the signed-in account the address will belong to. */
    accountId: text(),
    codeHash: text().notNull(),
    attempts: integer().default(0).notNull(),
    ip: text(),
    expiresAt: timestamptz().notNull(),
    usedAt: timestamptz(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_customer_codes_org_website_address_idx').on(
      table.orgId,
      table.websiteId,
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
      columns: [table.websiteId],
      foreignColumns: [websites.id],
      name: 'core_customer_codes_website_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [customerAccounts.id],
      name: 'core_customer_codes_account_id_fkey',
    }).onDelete('cascade'),
    check('core_customer_codes_kind_check', inList(table.kind, CUSTOMER_LOGIN_KINDS)),
    check('core_customer_codes_purpose_check', inList(table.purpose, CUSTOMER_CODE_PURPOSES)),
  ],
);

/**
 * An account signed in on its website, held as a refresh token. The token
 * rotates on every use; the previous one is kept, so using it again (it
 * leaked) ends the session.
 */
export const customerSessions = pgTable(
  'customer_sessions',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    accountId: text().notNull(),
    tokenHash: text().notNull(),
    previousTokenHash: text(),
    rotatedAt: timestamptz(),
    userAgent: text(),
    ip: text(),
    createdAt: createdAt(),
    lastUsedAt: timestamptz().defaultNow().notNull(),
    expiresAt: timestamptz().notNull(),
    revokedAt: timestamptz(),
  },
  (table) => [
    index('core_customer_sessions_org_account_idx').on(table.orgId, table.accountId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customer_sessions_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [customerAccounts.id],
      name: 'core_customer_sessions_account_id_fkey',
    }).onDelete('cascade'),
  ],
);
