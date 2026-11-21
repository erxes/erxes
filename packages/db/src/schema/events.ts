import { ACTOR_TYPES, CONTENT_TYPES, EVENT_DATA_KINDS } from '../enums';
import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * Every domain event, from core and plugins. Written in the same transaction
 * as the change (`core_publish_event()` for plugins on this database,
 * `POST /events` otherwise), so an event exists if and only if its change was
 * committed. The insert trigger queues one job per consumer in that
 * transaction too (`modules/events/consumers.ts`): timeline entries,
 * notifications, automation runs, webhooks and plugin deliveries.
 */
export const events = pgTable(
  'events',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** `core` or the plugin that published it. */
    source: text().notNull(),
    /** Namespaced by source: `core.customer.created`, `hr.leave.approved`. */
    type: text().notNull(),
    version: integer().default(1).notNull(),
    /** The customer or company it concerns, if any (its timeline). */
    subjectType: text({ enum: CONTENT_TYPES }),
    subjectId: text(),
    entityType: text(),
    entityId: text(),
    actorType: text({ enum: ACTOR_TYPES }).notNull(),
    actorId: text(),
    payload: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    /** With a subject: the timeline line (`Paid order #1042`). */
    summary: text(),
    link: text(),
    /** Who to notify: `{ userIds, title, body?, link?, priority? }`. */
    notify: jsonb().$type<Record<string, unknown>>(),
    dedupeKey: text(),
    occurredAt: timestamptz().defaultNow().notNull(),
    /** The automation run whose action caused it (loop protection), and how deep that chain is. */
    causedByRun: text(),
    depth: integer().default(0).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_events_org_created_idx').on(table.orgId, table.createdAt.desc(), table.id.desc()),
    index('core_events_subject_idx').on(table.orgId, table.subjectType, table.subjectId),
    uniqueIndex('core_events_dedupe_key')
      .on(table.orgId, table.source, table.dedupeKey)
      .where(sql`${table.dedupeKey} IS NOT NULL`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_events_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * What an organisation's events of a type have carried: one row per payload key with how its
 * values compare, and one with an empty key once the type happened at all. The automations
 * consumer writes them, so the builder offers an event's data without its publisher listing it.
 */
export const eventData = pgTable(
  'event_data',
  {
    orgId: orgIdColumn(),
    type: text().notNull(),
    key: text().notNull(),
    kind: text({ enum: EVENT_DATA_KINDS }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.orgId, table.type, table.key], name: 'core_event_data_pkey' }),
    check('core_event_data_kind_check', inList(table.kind, EVENT_DATA_KINDS)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_event_data_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
