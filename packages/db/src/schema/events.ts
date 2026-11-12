import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  customType,
  foreignKey,
  index,
  integer,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { CONTENT_TYPES, createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { ACTOR_TYPES } from './platform';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/** Postgres `xid8`: the id of the transaction that wrote a row. */
const xid8 = customType<{ data: string; driverData: string }>({ dataType: () => 'xid8' });

/**
 * Every domain event, from core and plugins: the transactional outbox.
 * Written in the same transaction as the change (`core_publish_event()` for
 * plugins on this database, `POST /events` otherwise), so an event exists if
 * and only if its change was committed. Consumers read in commit order
 * (`tx_id`, `seq`) and turn events into timeline entries, notifications,
 * automation runs and webhooks.
 */
export const events = pgTable(
  'events',
  {
    id: text().primaryKey(),
    seq: bigserial({ mode: 'number' }).notNull(),
    /** Transaction that wrote it: consumers only read finished transactions. */
    txId: xid8()
      .default(sql`pg_current_xact_id()`)
      .notNull(),
    orgId: text().notNull(),
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
    uniqueIndex('core_events_seq_key').on(table.seq),
    index('core_events_commit_order_idx').on(table.txId, table.seq),
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

/** How far each consumer has read the stream, in commit order. */
export const eventConsumers = pgTable('event_consumers', {
  name: text().primaryKey(),
  lastTxId: xid8()
    .default(sql`'0'::xid8`)
    .notNull(),
  lastSeq: bigint({ mode: 'number' }).default(0).notNull(),
  updatedAt: updatedAt(),
});

export const EVENT_FAILURE_STATUSES = ['retrying', 'dead'] as const;

export type EventFailureStatus = (typeof EVENT_FAILURE_STATUSES)[number];

/**
 * Events a consumer could not handle. The consumer's cursor moves on (one bad
 * event never blocks the stream); the event is retried here with backoff and,
 * after the last attempt, kept as `dead` until someone retries it by hand.
 */
export const eventFailures = pgTable(
  'event_failures',
  {
    consumer: text().notNull(),
    eventId: text().notNull(),
    orgId: text().notNull(),
    status: text({ enum: EVENT_FAILURE_STATUSES }).default('retrying').notNull(),
    attempts: integer().default(1).notNull(),
    lastError: text().notNull(),
    /** When to try again; null once dead. */
    nextAttemptAt: timestamptz(),
    firstFailedAt: timestamptz().defaultNow().notNull(),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({ columns: [table.consumer, table.eventId], name: 'core_event_failures_pkey' }),
    index('core_event_failures_due_idx')
      .on(table.nextAttemptAt)
      .where(sql`${table.status} = 'retrying'`),
    index('core_event_failures_org_idx').on(table.orgId, table.updatedAt.desc()),
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: 'core_event_failures_event_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_event_failures_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
