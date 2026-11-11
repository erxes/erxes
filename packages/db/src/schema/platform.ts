import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  check,
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
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { users } from './users';

/**
 * Who did something: a team member, a plugin (by name, e.g. `hr`) or core
 * itself (`system`: cleanups, imports). Ids only — names are resolved when shown.
 */
export const ACTOR_TYPES = ['user', 'plugin', 'system'] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

// ─── Files ──────────────────────────────────────────────────────────────────

/** `deleting`: removed, waiting for storage to confirm the bytes are gone (retried until it does). */
export const FILE_STATUSES = ['pending', 'ready', 'deleting'] as const;

/**
 * Uploaded files: metadata only, the bytes live in the storage driver
 * (local disk, S3, R2, MinIO) under `key`. A row starts `pending` when an
 * upload is granted and becomes `ready` once core has checked the stored
 * object; pending rows that never complete are cleaned up.
 */
export const files = pgTable(
  'files',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    /** Object key in the storage driver: `<orgId>/<yyyy>/<mm>/<id>`. */
    key: text().notNull(),
    name: text().notNull(),
    contentType: text().notNull(),
    size: bigint({ mode: 'number' }).notNull(),
    status: text({ enum: FILE_STATUSES }).default('pending').notNull(),
    /** `core` or the plugin that uploaded it. */
    source: text().default('core').notNull(),
    actorType: text({ enum: ACTOR_TYPES }).notNull(),
    actorId: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_files_key_key').on(table.key),
    index('core_files_org_created_idx').on(table.orgId, table.createdAt.desc(), table.id.desc()),
    index('core_files_pending_idx').on(table.createdAt).where(sql`${table.status} = 'pending'`),
    foreignKey({ columns: [table.orgId], foreignColumns: [organizations.id], name: 'core_files_org_id_fkey' }).onDelete(
      'cascade',
    ),
    check('core_files_status_check', sql`${table.status} IN ('pending', 'ready', 'deleting')`),
    index('core_files_deleting_idx').on(table.updatedAt).where(sql`${table.status} = 'deleting'`),
    check('core_files_size_check', sql`${table.size} >= 0`),
  ],
);

// ─── Notifications ──────────────────────────────────────────────────────────

export const NOTIFICATION_PRIORITIES = ['normal', 'high'] as const;

/**
 * A team member's inbox. Core and plugins create them; one row per recipient.
 * `dedupeKey` makes creating idempotent: a retried request does not notify twice.
 */
export const notifications = pgTable(
  'notifications',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    userId: text().notNull(),
    /** `core` or the plugin that sent it. */
    source: text().notNull(),
    /** What happened, namespaced by source: `core.customer.assigned`, `hr.leave.requested`. */
    kind: text().notNull(),
    title: text().notNull(),
    body: text(),
    /** Where clicking it goes, an app path such as `/hr/leaves/abc`. */
    link: text(),
    entityType: text(),
    entityId: text(),
    /** Details shown when the notification is opened, e.g. `{ changes: { field: [before, after] } }`. */
    data: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    priority: text({ enum: NOTIFICATION_PRIORITIES }).default('normal').notNull(),
    actorType: text({ enum: ACTOR_TYPES }).notNull(),
    actorId: text(),
    dedupeKey: text(),
    readAt: timestamptz(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_notifications_user_created_idx').on(table.userId, table.createdAt.desc(), table.id.desc()),
    index('core_notifications_unread_idx').on(table.userId).where(sql`${table.readAt} IS NULL`),
    uniqueIndex('core_notifications_dedupe_key')
      .on(table.orgId, table.userId, table.dedupeKey)
      .where(sql`${table.dedupeKey} IS NOT NULL`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_notifications_org_id_fkey',
    }).onDelete('cascade'),
    // Retention removes read notifications by age.
    index('core_notifications_read_at_idx').on(table.readAt).where(sql`${table.readAt} IS NOT NULL`),
    foreignKey({ columns: [table.userId], foreignColumns: [users.id], name: 'core_notifications_user_id_fkey' }).onDelete(
      'cascade',
    ),
    check('core_notifications_priority_check', sql`${table.priority} IN ('normal', 'high')`),
  ],
);

// ─── Activity timeline ──────────────────────────────────────────────────────

export const ACTIVITY_TARGETS = ['customer', 'company'] as const;

/**
 * The customer and company timeline: what happened with this person or
 * company across core and plugins. Small typed rows with ids, not copies of
 * records; a plugin entry links back to the plugin for details. A plugin's
 * internal history (an order's status changes) stays in the plugin.
 */
export const activities = pgTable(
  'activities',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    targetType: text({ enum: ACTIVITY_TARGETS }).notNull(),
    targetId: text().notNull(),
    /** `core` or the plugin that recorded it. */
    source: text().notNull(),
    /** Namespaced by source: `customer.updated`, `ecom.order.paid`. */
    type: text().notNull(),
    /** Readable line from a plugin (`Paid order #1042 · 120,000₮`); core types are rendered from `data`. */
    summary: text(),
    data: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    entityType: text(),
    entityId: text(),
    link: text(),
    actorType: text({ enum: ACTOR_TYPES }).notNull(),
    actorId: text(),
    dedupeKey: text(),
    /** Notes: pinned to the top of the timeline. */
    pinnedAt: timestamptz(),
    /** Notes: last edited. */
    editedAt: timestamptz(),
    occurredAt: timestamptz().defaultNow().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_activities_pinned_idx')
      .on(table.orgId, table.targetType, table.targetId)
      .where(sql`${table.pinnedAt} IS NOT NULL`),
    index('core_activities_target_idx').on(
      table.orgId,
      table.targetType,
      table.targetId,
      table.occurredAt.desc(),
      table.id.desc(),
    ),
    uniqueIndex('core_activities_dedupe_key')
      .on(table.orgId, table.source, table.dedupeKey)
      .where(sql`${table.dedupeKey} IS NOT NULL`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_activities_org_id_fkey',
    }).onDelete('cascade'),
    check('core_activities_target_type_check', sql`${table.targetType} IN ('customer', 'company')`),
  ],
);

// ─── Audit log ──────────────────────────────────────────────────────────────

/**
 * Who changed what in core, for owners and admins: sign-ins, team changes,
 * settings, deletes and merges, with before/after values. Append-only;
 * pruned after the retention period. Plugins keep their own audit.
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    actorType: text({ enum: ACTOR_TYPES }).notNull(),
    actorId: text(),
    /** `<record>.<verb>`: `customer.deleted`, `user.role_changed`, `auth.signed_in`. */
    action: text().notNull(),
    targetType: text(),
    targetId: text(),
    /** A readable name of the target at the time (email, customer name). */
    targetLabel: text(),
    /** Changed fields: `{ field: [before, after] }`. Secrets are never stored. */
    changes: jsonb().$type<Record<string, [unknown, unknown]>>(),
    metadata: jsonb().$type<Record<string, unknown>>(),
    ip: text(),
    userAgent: text(),
    /** `core` or the plugin that recorded it. */
    source: text().default('core').notNull(),
    /**
     * Tamper evidence: entries of an organisation form a hash chain
     * (`hash` = sha256 of the previous hash and this entry), set by a database
     * trigger. Editing or removing an entry breaks the chain.
     */
    chainSeq: bigint({ mode: 'number' }),
    prevHash: text(),
    hash: text(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_audit_logs_org_source_idx').on(table.orgId, table.source, table.createdAt.desc()),
    uniqueIndex('core_audit_logs_chain_key').on(table.orgId, table.chainSeq),
    index('core_audit_logs_org_created_idx').on(table.orgId, table.createdAt.desc(), table.id.desc()),
    index('core_audit_logs_target_idx').on(table.orgId, table.targetType, table.targetId),
    index('core_audit_logs_actor_idx').on(table.orgId, table.actorId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_audit_logs_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

// ─── Event stream ───────────────────────────────────────────────────────────

/** Postgres `xid8`: the id of the transaction that wrote a row. */
const xid8 = customType<{ data: string; driverData: string }>({ dataType: () => 'xid8' });

export const SUBJECT_TYPES = ['customer', 'company'] as const;

/**
 * Every domain event, from core and plugins: the transactional outbox.
 * Written in the same transaction as the change (`core_publish_event()` for
 * plugins on this database, `POST /events` otherwise), so an event exists if
 * and only if its change was committed. Consumers read in commit order
 * (`tx_id`, `seq`) and turn events into timeline entries, notifications and,
 * later, automations and webhooks.
 */
export const events = pgTable(
  'events',
  {
    id: text().primaryKey(),
    seq: bigserial({ mode: 'number' }).notNull(),
    /** Transaction that wrote it: consumers only read finished transactions. */
    txId: xid8().default(sql`pg_current_xact_id()`).notNull(),
    orgId: text().notNull(),
    /** `core` or the plugin that published it. */
    source: text().notNull(),
    /** Namespaced by source: `core.customer.created`, `hr.leave.approved`. */
    type: text().notNull(),
    version: integer().default(1).notNull(),
    /** The customer or company it concerns, if any (its timeline). */
    subjectType: text({ enum: SUBJECT_TYPES }),
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
    foreignKey({ columns: [table.orgId], foreignColumns: [organizations.id], name: 'core_events_org_id_fkey' }).onDelete(
      'cascade',
    ),
  ],
);

/** How far each consumer has read the stream, in commit order. */
export const eventConsumers = pgTable('event_consumers', {
  name: text().primaryKey(),
  lastTxId: xid8().default(sql`'0'::xid8`).notNull(),
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
    index('core_event_failures_due_idx').on(table.nextAttemptAt).where(sql`${table.status} = 'retrying'`),
    index('core_event_failures_org_idx').on(table.orgId, table.updatedAt.desc()),
    foreignKey({ columns: [table.eventId], foreignColumns: [events.id], name: 'core_event_failures_event_id_fkey' }).onDelete(
      'cascade',
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_event_failures_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * Signed checkpoints of each organisation's audit chain: core signs the head
 * (`chain_seq`, `hash`) with its signing key, which lives in server config and
 * never in the database. Rewriting the chain (even consistently, by someone
 * with full database access) no longer matches a signed checkpoint.
 */
export const auditCheckpoints = pgTable(
  'audit_checkpoints',
  {
    orgId: text().notNull(),
    chainSeq: bigint({ mode: 'number' }).notNull(),
    hash: text().notNull(),
    /** Signing key id (`kid` in the published JWKS). */
    keyId: text().notNull(),
    /** Compact JWS (ES256) of `{ org, seq, hash, iat }`. */
    signature: text().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.orgId, table.chainSeq], name: 'core_audit_checkpoints_pkey' }),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_audit_checkpoints_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
