import { sql } from 'drizzle-orm';
import { bigint, check, foreignKey, index, jsonb, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
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

export const FILE_STATUSES = ['pending', 'ready'] as const;

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
    check('core_files_status_check', sql`${table.status} IN ('pending', 'ready')`),
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
    occurredAt: timestamptz().defaultNow().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
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
    createdAt: createdAt(),
  },
  (table) => [
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
