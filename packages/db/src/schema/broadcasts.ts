import {
  BROADCAST_CHANNELS,
  BROADCAST_RECIPIENT_STATUSES,
  BROADCAST_STATUSES,
  SUPPRESSION_REASONS,
} from '../enums';
import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { type ConditionGroup, createdAt, updatedAt } from './common';
import { customers } from './customers';
import { organizations } from './organizations';
import { users } from './users';
import { views } from './views';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export type BroadcastChannel = (typeof BROADCAST_CHANNELS)[number];

export type BroadcastStatus = (typeof BROADCAST_STATUSES)[number];

export type BroadcastRecipientStatus = (typeof BROADCAST_RECIPIENT_STATUSES)[number];

export type SuppressionReason = (typeof SUPPRESSION_REASONS)[number];

/**
 * A message to many customers at once, by email or SMS (decision 47). The
 * audience is a saved customer view (live: its filter as it is when sending
 * starts), a filter of its own, or everyone. Sending freezes the audience
 * into `core_broadcast_recipients`.
 */
export const broadcasts = pgTable(
  'broadcasts',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    name: text().notNull(),
    channel: text({ enum: BROADCAST_CHANNELS }).notNull(),
    status: text({ enum: BROADCAST_STATUSES }).default('draft').notNull(),
    /** A saved customer view; its filter is read when sending starts. */
    viewId: text(),
    /** The broadcast's own filter, when it has no view. Neither: every customer. */
    filter: jsonb().$type<ConditionGroup>(),
    /** Email only. Placeholders such as `{{ firstName | there }}` work here too. */
    subject: text(),
    /** Email only: the line inboxes show after the subject. */
    preheader: text(),
    /** Markdown for email, plain text for SMS, with placeholders. */
    body: text().default('').notNull(),
    /** Email only: the name shown with the address it comes from. */
    fromName: text(),
    /** Email only: a confirmed sender's address it goes out as; null: the sending address. */
    fromEmail: text(),
    replyTo: text(),
    scheduledAt: timestamptz(),
    startedAt: timestamptz(),
    finishedAt: timestamptz(),
    /** Why sending stopped, when it failed. */
    error: text(),
    /** Recipients frozen when sending started. */
    total: integer().default(0).notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_broadcasts_org_created_idx').on(
      table.orgId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    // The sweep finds broadcasts still going out.
    index('core_broadcasts_sending_idx')
      .on(table.status)
      .where(sql`${table.status} = 'sending'`),
    check('core_broadcasts_channel_check', inList(table.channel, BROADCAST_CHANNELS)),
    check('core_broadcasts_status_check', inList(table.status, BROADCAST_STATUSES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_broadcasts_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.viewId],
      foreignColumns: [views.id],
      name: 'core_broadcasts_view_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: 'core_broadcasts_created_by_fkey',
    }).onDelete('set null'),
  ],
);

/**
 * Who a broadcast goes to, frozen when sending starts: one row per address,
 * so two customers sharing an email get one copy. Workers claim rows under a
 * lease and settle only the rows their claim still holds.
 */
export const broadcastRecipients = pgTable(
  'broadcast_recipients',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    broadcastId: text().notNull(),
    customerId: text().notNull(),
    /** The email (lower-cased) or phone it goes to. */
    address: text().notNull(),
    status: text({ enum: BROADCAST_RECIPIENT_STATUSES }).default('queued').notNull(),
    reason: text(),
    /** The claim holding the row while it is sent; a lapsed one is taken back. */
    claim: text(),
    claimedUntil: timestamptz(),
    attempts: smallint().default(0).notNull(),
    sentAt: timestamptz(),
    openedAt: timestamptz(),
    clickedAt: timestamptz(),
    unsubscribedAt: timestamptz(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_broadcast_recipients_address_key').on(table.broadcastId, table.address),
    index('core_broadcast_recipients_status_idx').on(table.broadcastId, table.status, table.id),
    index('core_broadcast_recipients_customer_idx').on(table.customerId),
    check(
      'core_broadcast_recipients_status_check',
      inList(table.status, BROADCAST_RECIPIENT_STATUSES),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_broadcast_recipients_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.broadcastId],
      foreignColumns: [broadcasts.id],
      name: 'core_broadcast_recipients_broadcast_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: 'core_broadcast_recipients_customer_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * Addresses that get no broadcasts: unsubscribed, bounced, complained, or
 * added by a member. Kept by address rather than customer, so a merge, a
 * duplicate or a re-import can't reach someone who said stop.
 */
export const suppressions = pgTable(
  'suppressions',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    channel: text({ enum: BROADCAST_CHANNELS }).notNull(),
    /** Lower-cased email, or a phone without spaces. */
    address: text().notNull(),
    reason: text({ enum: SUPPRESSION_REASONS }).notNull(),
    /** The server's words for a bounce, or a member's note. */
    detail: text(),
    /** The broadcast it came from (an unsubscribe link, a bounce). */
    broadcastId: text(),
    createdBy: text(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('core_suppressions_address_key').on(table.orgId, table.channel, table.address),
    index('core_suppressions_org_created_idx').on(
      table.orgId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    check('core_suppressions_channel_check', inList(table.channel, BROADCAST_CHANNELS)),
    check('core_suppressions_reason_check', inList(table.reason, SUPPRESSION_REASONS)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_suppressions_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.broadcastId],
      foreignColumns: [broadcasts.id],
      name: 'core_suppressions_broadcast_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: 'core_suppressions_created_by_fkey',
    }).onDelete('set null'),
  ],
);
