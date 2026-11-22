import { CUSTOMER_NOTIFICATION_CHANNELS } from '../enums';
import { sql } from 'drizzle-orm';
import { foreignKey, index, jsonb, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { customers } from './customers';
import { organizations } from './organizations';
import { websites } from './websites';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export type CustomerNotificationChannel = (typeof CUSTOMER_NOTIFICATION_CHANNELS)[number];

/**
 * A customer's inbox (decision 45): what plugins tell a signed-in customer,
 * read on the plugin's website through `/customer/notifications`. One
 * row per customer; `channels` are where else it went (email, SMS).
 */
export const customerNotifications = pgTable(
  'customer_notifications',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    customerId: text().notNull(),
    /** The website it is for, shown there only; null: every website the customer signs in to. */
    websiteId: text(),
    /** The plugin that sent it. */
    source: text().notNull(),
    /** Namespaced by the plugin: `content.post.published`. */
    kind: text().notNull(),
    title: text().notNull(),
    body: text(),
    /** A path on the website, such as `/posts/abc`. */
    link: text(),
    entityType: text(),
    entityId: text(),
    data: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    channels: text({ enum: CUSTOMER_NOTIFICATION_CHANNELS })
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    dedupeKey: text(),
    readAt: timestamptz(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_customer_notifications_customer_created_idx').on(
      table.customerId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index('core_customer_notifications_unread_idx')
      .on(table.customerId)
      .where(sql`${table.readAt} IS NULL`),
    uniqueIndex('core_customer_notifications_dedupe_key')
      .on(table.orgId, table.customerId, table.dedupeKey)
      .where(sql`${table.dedupeKey} IS NOT NULL`),
    // Retention removes read notifications by age.
    index('core_customer_notifications_read_at_idx')
      .on(table.readAt)
      .where(sql`${table.readAt} IS NOT NULL`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customer_notifications_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: 'core_customer_notifications_customer_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.websiteId],
      foreignColumns: [websites.id],
      name: 'core_customer_notifications_website_id_fkey',
    }).onDelete('cascade'),
  ],
);
