import { CUSTOMER_ADDRESS_KINDS, CUSTOMER_CODE_PURPOSES, CUSTOMER_LOGIN_KINDS } from '../enums';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, type CustomValue } from './common';
import { customers } from './customers';
import { organizations } from './organizations';
import { portals } from './portals';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export type CustomerLoginKind = (typeof CUSTOMER_LOGIN_KINDS)[number];

export type CustomerAddressKind = (typeof CUSTOMER_ADDRESS_KINDS)[number];

/** A sign-up form, checked when sent: the customer's name and the fields customers may fill. */
export interface CustomerSignUpData {
  firstName: string;
  lastName?: string | null;
  /** `YYYY-MM-DD` */
  birthDate?: string | null;
  /** By field id, as `customers.update` takes them. */
  customFields?: Record<string, CustomValue>;
}

/**
 * A customer's sign-up on one portal (decision 42). The same person on two
 * portals is one customer with two accounts, each with its own logins and sessions.
 */
export const customerAccounts = pgTable(
  'customer_accounts',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    portalId: text().notNull(),
    customerId: text().notNull(),
    createdAt: createdAt(),
    lastSignedInAt: timestamptz(),
  },
  (table) => [
    uniqueIndex('core_customer_accounts_org_portal_customer_key').on(
      table.orgId,
      table.portalId,
      table.customerId,
    ),
    // Logins and sessions name the account and its portal together.
    uniqueIndex('core_customer_accounts_id_portal_key').on(table.id, table.portalId),
    index('core_customer_accounts_org_customer_idx').on(table.orgId, table.customerId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customer_accounts_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.portalId],
      foreignColumns: [portals.id],
      name: 'core_customer_accounts_portal_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: 'core_customer_accounts_customer_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * What an account signs in with: an email address or phone it proved with a code, or its
 * account at Google, Apple or Facebook (`value`: that service's user id). One per value on a portal.
 */
export const customerLogins = pgTable(
  'customer_logins',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    accountId: text().notNull(),
    portalId: text().notNull(),
    kind: text({ enum: CUSTOMER_LOGIN_KINDS }).notNull(),
    /** Normalised: lower-case email, phone without formatting, the service's user id. */
    value: text().notNull(),
    createdAt: createdAt(),
    lastUsedAt: timestamptz(),
  },
  (table) => [
    uniqueIndex('core_customer_logins_org_portal_kind_value_key').on(
      table.orgId,
      table.portalId,
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
      columns: [table.accountId, table.portalId],
      foreignColumns: [customerAccounts.id, customerAccounts.portalId],
      name: 'core_customer_logins_account_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    check('core_customer_logins_kind_check', inList(table.kind, CUSTOMER_LOGIN_KINDS)),
  ],
);

/**
 * One-time sign-in codes for a portal: 6 digits, stored as an HMAC, valid 10
 * minutes and for 5 tries. Kept after use, so sending is limited per address.
 * A portal with a verify.mn connection has the customer text the code instead
 * (`replySessionId`): it works once verify.mn says that phone sent it.
 */
export const customerCodes = pgTable(
  'customer_codes',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    portalId: text().notNull(),
    kind: text({ enum: CUSTOMER_ADDRESS_KINDS }).notNull(),
    value: text().notNull(),
    purpose: text({ enum: CUSTOMER_CODE_PURPOSES }).notNull(),
    /** `add_login`: the signed-in account the address will belong to. */
    accountId: text(),
    /** `sign_up`: what the sign-up form sent, saved on the customer once the code is confirmed. */
    signUp: jsonb().$type<CustomerSignUpData>(),
    codeHash: text().notNull(),
    /** The phone-reply service's session the customer texts the code to (verify.mn). */
    replySessionId: text(),
    attempts: integer().default(0).notNull(),
    ip: text(),
    expiresAt: timestamptz().notNull(),
    usedAt: timestamptz(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_customer_codes_org_portal_address_idx').on(
      table.orgId,
      table.portalId,
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
      columns: [table.portalId],
      foreignColumns: [portals.id],
      name: 'core_customer_codes_portal_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [customerAccounts.id],
      name: 'core_customer_codes_account_id_fkey',
    }).onDelete('cascade'),
    check('core_customer_codes_kind_check', inList(table.kind, CUSTOMER_ADDRESS_KINDS)),
    check('core_customer_codes_purpose_check', inList(table.purpose, CUSTOMER_CODE_PURPOSES)),
  ],
);

/**
 * An account signed in on its portal, held as a refresh token. The token
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
