import {
  boolean,
  check,
  foreignKey,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { EMAIL_PROVIDERS } from '../enums';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { users } from './users';

/**
 * How the organisation sends its emails (old erxes' Settings › Mail config):
 * an SMTP server, SendGrid or Amazon SES, from its own address. Without a row
 * they go through the server's (`EMAIL_SMTP_URL`).
 */
export const emailSettings = pgTable(
  'email_settings',
  {
    orgId: orgIdColumn().primaryKey(),
    provider: text({ enum: EMAIL_PROVIDERS }).notNull(),
    fromName: text().default('').notNull(),
    fromEmail: text().notNull(),
    /** `smtp`: the server, its port, and TLS from the start (465) rather than STARTTLS. */
    smtpHost: text().default('').notNull(),
    smtpPort: integer().default(587).notNull(),
    smtpSecure: boolean().default(false).notNull(),
    /** `smtp`: its user name; `ses`: the access key id. */
    username: text().default('').notNull(),
    /** `ses`: the AWS region, for example `us-east-1`. */
    region: text().default('').notNull(),
    /** The password, API key or secret access key, sealed (`lib/secrets`); never sent out. */
    secretSealed: text().notNull(),
    updatedBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check('core_email_settings_provider_check', inList(table.provider, EMAIL_PROVIDERS)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_email_settings_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * Addresses broadcasts and automations may send as (old erxes' Mail config ›
 * Senders). One is usable once someone opened the link emailed to it, which
 * shows the organisation reads that mailbox.
 */
export const emailSenders = pgTable(
  'email_senders',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** Lower case. */
    email: text().notNull(),
    name: text().notNull(),
    /** When the link emailed to the address was opened; null: waiting for it. */
    confirmedAt: timestamp({ withTimezone: true, mode: 'date' }),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_email_senders_org_email_key').on(table.orgId, table.email),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_email_senders_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: 'core_email_senders_created_by_fkey',
    }).onDelete('set null'),
  ],
);
