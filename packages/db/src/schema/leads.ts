import { sql } from 'drizzle-orm';
import { check, foreignKey, index, text, timestamp } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { customers } from './customers';
import { organizations } from './organizations';

export const LEAD_EVENTS = ['created', 'stage', 'converted', 'reopened'] as const;

/**
 * A lead's journey: where it entered, every stage move, its conversion to a
 * customer (and back). Funnel reports, time in each stage and conversion
 * rates are read from here. Stage ids are kept as written (a deleted stage
 * leaves its id), so history never changes.
 */
export const leadEvents = pgTable(
  'lead_events',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    customerId: text().notNull(),
    event: text({ enum: LEAD_EVENTS }).notNull(),
    fromStageId: text(),
    toStageId: text(),
    /** Why it was disqualified, or a note on the move. */
    reason: text(),
    actorType: text().notNull(),
    actorId: text(),
    createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('core_lead_events_org_created_idx').on(table.orgId, table.createdAt),
    index('core_lead_events_customer_idx').on(table.customerId, table.createdAt),
    foreignKey({ columns: [table.customerId], foreignColumns: [customers.id], name: 'core_lead_events_customer_id_fkey' }).onDelete('cascade'),
    foreignKey({ columns: [table.orgId], foreignColumns: [organizations.id], name: 'core_lead_events_org_id_fkey' }).onDelete('cascade'),
    check('core_lead_events_event_check', sql`${table.event} IN ('created', 'stage', 'converted', 'reopened')`),
  ],
);
