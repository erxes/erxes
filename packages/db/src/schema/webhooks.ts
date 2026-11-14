import { WEBHOOK_DELIVERY_STATUSES, WEBHOOK_STATUSES } from '../enums';
import { check, foreignKey, index, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * Outgoing webhooks: an organisation's endpoint that receives its events
 * (`core.customer.created`, `hr.leave.approved`, prefixes like `core.*`),
 * signed with the endpoint's secret (stored encrypted).
 */
export const webhooks = pgTable(
  'webhooks',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    url: text().notNull(),
    description: text(),
    /** Event types, `<prefix>.*`, or `*` for everything. */
    eventTypes: text().array().notNull(),
    /** AES-GCM sealed signing secret (`src/lib/secrets.ts`). */
    secretSealed: text().notNull(),
    status: text({ enum: WEBHOOK_STATUSES }).default('active').notNull(),
    /** Why it was turned off (`by member`, or after failing for days). */
    disabledReason: text(),
    /** Deliveries failed in a row (reset by a success). */
    consecutiveFailures: integer().default(0).notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_webhooks_org_idx').on(table.orgId, table.status),
    check('core_webhooks_status_check', inList(table.status, WEBHOOK_STATUSES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_webhooks_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/** Each event sent (or being sent) to an endpoint, with the last attempt's outcome. */
export const webhookDeliveries = pgTable(
  'webhook_deliveries',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    webhookId: text().notNull(),
    eventId: text().notNull(),
    eventType: text().notNull(),
    status: text({ enum: WEBHOOK_DELIVERY_STATUSES }).default('pending').notNull(),
    attempts: integer().default(0).notNull(),
    responseStatus: integer(),
    /** The first 2 KB of the endpoint's answer. */
    responseBody: text(),
    error: text(),
    durationMs: integer(),
    deliveredAt: timestamptz(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_webhook_deliveries_webhook_idx').on(
      table.orgId,
      table.webhookId,
      table.createdAt.desc(),
    ),
    index('core_webhook_deliveries_created_idx').on(table.createdAt),
    check('core_webhook_deliveries_status_check', inList(table.status, WEBHOOK_DELIVERY_STATUSES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_webhook_deliveries_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.webhookId],
      foreignColumns: [webhooks.id],
      name: 'core_webhook_deliveries_webhook_id_fkey',
    }).onDelete('cascade'),
  ],
);
