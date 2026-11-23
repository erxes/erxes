import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import {
  EMAIL_DELIVERY_PROVIDERS,
  EMAIL_DELIVERY_STATUSES,
  EMAIL_PROVIDERS,
  EMAIL_RAMP_TIERS,
  EMAIL_SOURCES,
  REPLY_TO_STATUSES,
} from '../emailEnums';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { secrets } from './secrets';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * How the organisation sends its emails (old erxes' Settings › Mail config):
 * an SMTP server, SendGrid or Amazon SES, from its own address. Without a row
 * they go through the server's (`EMAIL_SMTP_URL`). Self-hosted only: on SaaS
 * every organisation sends through the server's.
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
    secretId: text().notNull(),
    /** `sendgrid`: the Signed Event Webhook's verification key (public), checked on every event batch. */
    eventsKey: text().default('').notNull(),
    /** `ses`: the configuration set every email names, whose event destination is the SNS topic. */
    configurationSet: text().default('').notNull(),
    /** `ses`: the SNS topic its events come through; notifications from any other are refused. */
    eventsTopicArn: text().default('').notNull(),
    /**
     * `sendgrid`, `ses`: the domains the provider last said it sends from,
     * lower-cased. Any address on them may be an email's From.
     */
    verifiedDomains: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** When the provider last answered; null: never asked. */
    domainsCheckedAt: timestamptz(),
    /** What the provider said when it last couldn't answer; null once it does. */
    domainsError: text(),
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
    foreignKey({
      columns: [table.secretId],
      foreignColumns: [secrets.id],
      name: 'core_email_settings_secret_id_fkey',
    }),
  ],
);

/**
 * Addresses the organisation's emails may ask replies to go to. Each one is
 * confirmed by a link sent to it (a member's own address at once), so no
 * organisation can send with another's inbox as its Reply-To. The link carries
 * `<id>.<secret>`; only the secret's SHA-256 is stored.
 */
export const emailReplyTos = pgTable(
  'email_reply_tos',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** Lower-cased. */
    email: text().notNull(),
    status: text({ enum: REPLY_TO_STATUSES }).notNull(),
    secretHash: text(),
    expiresAt: timestamptz(),
    verifiedAt: timestamptz(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_email_reply_tos_org_email_key').on(table.orgId, sql`lower(${table.email})`),
    check('core_email_reply_tos_status_check', inList(table.status, REPLY_TO_STATUSES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_email_reply_tos_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * Every email the organisation sends, one row each, kept 90 days: what it was
 * for, to whom, whether the server took it, and what the provider's events
 * told later (delivered, bounced, complained). No body is kept. A queued
 * email's row is written with its job, so a rolled-back one leaves none.
 */
export const emailDeliveries = pgTable(
  'email_deliveries',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    source: text({ enum: EMAIL_SOURCES }).notNull(),
    /** The record it came from: the broadcast, automation, plugin, receipt … */
    sourceId: text(),
    /** Lower-cased. */
    to: text().notNull(),
    /** The customer it went to, when the sender knew: its timeline shows the email. */
    customerId: text(),
    subject: text().notNull(),
    status: text({ enum: EMAIL_DELIVERY_STATUSES }).notNull(),
    /** What its last try went out through; null until it is tried. */
    provider: text({ enum: EMAIL_DELIVERY_PROVIDERS }),
    /** Tries so far; a refused try waits for the next. */
    attempts: smallint().default(0).notNull(),
    /** What the server said when it last refused, or why it couldn't be reached. */
    error: text(),
    sentAt: timestamptz(),
    /** When the provider's event behind `delivered`, `bounced` or `complained` happened. */
    reportedAt: timestamptz(),
    /** Times the recipient's server asked the provider to try later (it keeps trying). */
    deferrals: smallint().default(0).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_email_deliveries_org_created_idx').on(
      table.orgId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index('core_email_deliveries_source_idx').on(table.orgId, table.source, table.sourceId),
    check('core_email_deliveries_source_check', inList(table.source, EMAIL_SOURCES)),
    check('core_email_deliveries_status_check', inList(table.status, EMAIL_DELIVERY_STATUSES)),
    check('core_email_deliveries_provider_check', inList(table.provider, EMAIL_DELIVERY_PROVIDERS)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_email_deliveries_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * What the provider's events told about each address the organisation
 * emailed: deliveries, and soft bounces since the last one. Only the events
 * write it (`email/events/apply.ts`), so a row means the provider reported on
 * the address; an email the server merely took proves nothing. Suppressions
 * stay in `core_suppressions`.
 */
export const emailAddresses = pgTable(
  'email_addresses',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** Lower-cased (checked). */
    email: text().notNull(),
    /** Emails the provider took for it; proves nothing (see `deliveredCount`). */
    sentCount: integer().default(0).notNull(),
    lastSentAt: timestamptz(),
    deliveredCount: integer().default(0).notNull(),
    lastDeliveredAt: timestamptz(),
    /** Deferrals and bounces that don't suppress, since the last delivery. */
    softBounces: integer().default(0).notNull(),
    lastBouncedAt: timestamptz(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // Stored lower-cased (the check), so the plain key is unique per lower(email), an upsert can
    // name it, and joins with `core_suppressions.address` (lower-cased too) use it.
    uniqueIndex('core_email_addresses_org_email_key').on(table.orgId, table.email),
    check('core_email_addresses_email_check', sql`${table.email} = lower(${table.email})`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_email_addresses_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * The organisation's sending ramp (Settings › Integrations › Email sending ›
 * Limits): how many emails a day it may send now (`tier` into
 * `EMAIL_RAMP_TIERS`), what it sent today (UTC), and whether a bounce rate
 * halted it. Written when it first sends; the ramp's evaluation moves the
 * tier up or down from the delivery log.
 */
export const emailRamps = pgTable(
  'email_ramps',
  {
    orgId: orgIdColumn().primaryKey(),
    tier: smallint().default(0).notNull(),
    /** Self-hosted with its own SendGrid or SES only: off, erxes neither paces nor halts. */
    enabled: boolean().default(true).notNull(),
    /** The day `sentToday` counts, in the organisation's time zone (written by the ramp). */
    day: date({ mode: 'string' })
      .default(sql`(now() at time zone 'utc')::date`)
      .notNull(),
    sentToday: integer().default(0).notNull(),
    /** When the tier last moved, up or down: once a day at most. */
    tierChangedAt: timestamptz(),
    evaluatedAt: timestamptz(),
    /** Set when the bounce and complaint rate reached the halt line; only auth emails go out. */
    haltedAt: timestamptz(),
    haltReason: text(),
    /** The member who resumed sending last, and why; the rates count from then. */
    resumedAt: timestamptz(),
    resumedBy: text(),
    resumeReason: text(),
    /** The last notice that sign-in emails hit their hourly cap: one an hour at most. */
    cappedNoticeAt: timestamptz(),
    /** The organisation's day admins were told the daily limit was used: once a day. */
    limitNoticeDay: date({ mode: 'string' }),
    /** When admins were told the provider's events are refused for want of a key; a saved key clears it. */
    eventsNoticeAt: timestamptz(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check(
      'core_email_ramps_tier_check',
      sql`${table.tier} >= 0 and ${table.tier} < ${sql.raw(String(EMAIL_RAMP_TIERS.length))}`,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_email_ramps_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
