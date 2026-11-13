import { ACTIVITY_TARGETS, ACTOR_TYPES, FILE_STATUSES, NOTIFICATION_PRIORITIES } from '../enums';
import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  foreignKey,
  index,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { users } from './users';

export type ActorType = (typeof ACTOR_TYPES)[number];

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

// ─── Files ──────────────────────────────────────────────────────────────────

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
    orgId: orgIdColumn(),
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
    index('core_files_pending_idx')
      .on(table.createdAt)
      .where(sql`${table.status} = 'pending'`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_files_org_id_fkey',
    }).onDelete('cascade'),
    check('core_files_status_check', inList(table.status, FILE_STATUSES)),
    index('core_files_deleting_idx')
      .on(table.updatedAt)
      .where(sql`${table.status} = 'deleting'`),
    check('core_files_size_check', sql`${table.size} >= 0`),
  ],
);

// ─── Notifications ──────────────────────────────────────────────────────────

/**
 * A team member's inbox. Core and plugins create them; one row per recipient.
 * `dedupeKey` makes creating idempotent: a retried request does not notify twice.
 */
export const notifications = pgTable(
  'notifications',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
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
    index('core_notifications_user_created_idx').on(
      table.userId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index('core_notifications_unread_idx')
      .on(table.userId)
      .where(sql`${table.readAt} IS NULL`),
    uniqueIndex('core_notifications_dedupe_key')
      .on(table.orgId, table.userId, table.dedupeKey)
      .where(sql`${table.dedupeKey} IS NOT NULL`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_notifications_org_id_fkey',
    }).onDelete('cascade'),
    // Retention removes read notifications by age.
    index('core_notifications_read_at_idx')
      .on(table.readAt)
      .where(sql`${table.readAt} IS NOT NULL`),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'core_notifications_user_id_fkey',
    }).onDelete('cascade'),
    check('core_notifications_priority_check', inList(table.priority, NOTIFICATION_PRIORITIES)),
  ],
);

// ─── Activity timeline ──────────────────────────────────────────────────────

/**
 * Timelines: what happened with a customer or company — or a plugin's own
 * record (`hr.employee`) — across core and plugins. Small typed rows with ids, not copies of
 * records; a plugin entry links back to the plugin for details. A plugin's
 * internal history (an order's status changes) stays in the plugin.
 */
export const activities = pgTable(
  'activities',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** `customer`, `company`, or a plugin's record type (`hr.employee`). */
    targetType: text().notNull(),
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
    check(
      'core_activities_target_type_check',
      sql`${inList(table.targetType, ACTIVITY_TARGETS)} OR ${table.targetType} ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'`,
    ),
    index('core_activities_actor_idx').on(
      table.orgId,
      table.targetType,
      table.targetId,
      table.actorId,
    ),
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
    orgId: orgIdColumn(),
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
    index('core_audit_logs_org_created_idx').on(
      table.orgId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index('core_audit_logs_target_idx').on(table.orgId, table.targetType, table.targetId),
    index('core_audit_logs_actor_idx').on(table.orgId, table.actorId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_audit_logs_org_id_fkey',
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
    orgId: orgIdColumn(),
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
