import { sql } from 'drizzle-orm';
import {
  check,
  date,
  foreignKey,
  index,
  jsonb,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import type { CustomValue } from './common';
import { organizations } from './organizations';
import { users } from './users';

export const CUSTOMER_STATES = ['lead', 'customer'] as const;

/** People the organisation works with, shared by every plugin. */
export const customers = pgTable(
  'customers',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    state: text({ enum: CUSTOMER_STATES }).default('customer').notNull(),
    firstName: text(),
    middleName: text(),
    lastName: text(),
    avatarUrl: text(),
    /** Lower-cased; also the first entry of `emails`. */
    primaryEmail: text(),
    emails: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** Without spaces, brackets and dashes; also the first entry of `phones`. */
    primaryPhone: text(),
    phones: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** ISO/IEC 5218: 0 not known, 1 male, 2 female, 9 not applicable. */
    /** ISO/IEC 5218: 0 not known, 1 male, 2 female, 9 not applicable. */
    sex: smallint().$type<0 | 1 | 2 | 9>(),
    birthDate: date({ mode: 'string' }),
    position: text(),
    department: text(),
    code: text(),
    description: text(),
    ownerId: text(),
    customFields: jsonb().$type<Record<string, CustomValue>>().default({}).notNull(),
    /** Customers merged into this one (their ids keep resolving here). */
    mergedIds: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    createdBy: text(),
    createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    // One customer per primary email / phone in an organisation.
    uniqueIndex('core_customers_org_primary_email_key')
      .on(table.orgId, sql`lower(${table.primaryEmail})`)
      .where(sql`${table.primaryEmail} IS NOT NULL`),
    uniqueIndex('core_customers_org_primary_phone_key')
      .on(table.orgId, table.primaryPhone)
      .where(sql`${table.primaryPhone} IS NOT NULL`),
    // Keyset paging, newest first.
    index('core_customers_org_created_idx').on(
      table.orgId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index('core_customers_org_state_idx').on(table.orgId, table.state),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customers_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.id],
      name: 'core_customers_owner_id_fkey',
    }).onDelete('set null'),
    check('core_customers_state_check', sql`${table.state} IN ('lead', 'customer')`),
    check('core_customers_sex_check', sql`${table.sex} IN (0, 1, 2, 9)`),
  ],
);
