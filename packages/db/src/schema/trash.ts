import { ACTOR_TYPES, CONTENT_TYPES } from '../enums';
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
import type { CustomValue } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/** A row as `trash.snapshot` keeps it: its Drizzle keys, dates as ISO strings once stored. */
type SnapshotRow = { id: string } & Record<string, unknown>;

/** What went to the bin with a record. */
export interface TrashSnapshot {
  /** The customer or company row, with its `customFields` values. */
  row: SnapshotRow & { customFields?: Record<string, CustomValue> };
  tagIds: string[];
  links: { customerId: string; companyId: string }[];
  /** Its timeline entries (`core_activities` rows). */
  activities: SnapshotRow[];
}

/**
 * The recycle bin: deleted customers and companies, with everything that went
 * with them (tags, links, timeline), restorable for 30 days, then purged for
 * good. A mistaken or malicious bulk delete can be undone.
 */
export const trash = pgTable(
  'trash',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    recordType: text({ enum: CONTENT_TYPES }).notNull(),
    recordId: text().notNull(),
    /** Its name at deletion, for the bin's list. */
    label: text(),
    /** The row, its tags and links, and its timeline entries. */
    snapshot: jsonb().$type<TrashSnapshot>().notNull(),
    deletedByType: text({ enum: ACTOR_TYPES }).notNull(),
    deletedBy: text(),
    deletedAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    purgeAt: timestamptz().notNull(),
  },
  (table) => [
    uniqueIndex('core_trash_record_key').on(table.orgId, table.recordType, table.recordId),
    index('core_trash_org_idx').on(table.orgId, table.deletedAt.desc()),
    index('core_trash_purge_idx').on(table.purgeAt),
    check('core_trash_record_type_check', inList(table.recordType, CONTENT_TYPES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_trash_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * Deletions per organisation and actor in 5-minute buckets: a member or a
 * plugin deleting far more than usual is stopped and the owners are told.
 */
export const deletionCounters = pgTable(
  'deletion_counters',
  {
    orgId: orgIdColumn(),
    /** `user:<id>` or `plugin:<name>`. */
    actor: text().notNull(),
    bucket: timestamp({ withTimezone: true, mode: 'date' }).notNull(),
    count: integer().default(0).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.orgId, table.actor, table.bucket],
      name: 'core_deletion_counters_pkey',
    }),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_deletion_counters_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
