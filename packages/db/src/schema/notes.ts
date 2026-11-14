import { sql } from 'drizzle-orm';
import { foreignKey, index, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { organizations } from './organizations';
import { activities } from './platform';
import { users } from './users';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * A member's note on a timeline. The note is its timeline entry's own row
 * (same id, `<target>.note`): the entry says where it is and who wrote it
 * (`target_*`, `actor_id`), this row holds what only a note has. Deleting the
 * entry deletes the note.
 */
export const notes = pgTable(
  'notes',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    body: text().notNull(),
    /** Members mentioned with @: they are notified. */
    mentions: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** Attached files (uploaded through `/files`). */
    fileIds: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** Pinned to the top of the timeline. */
    pinnedAt: timestamptz(),
    /** Last reworded. */
    editedAt: timestamptz(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [activities.id],
      name: 'core_notes_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_notes_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/** Earlier wordings of a note: each edit keeps the text it replaced. */
export const noteVersions = pgTable(
  'note_versions',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    noteId: text().notNull(),
    body: text().notNull(),
    /** When this wording was written. */
    editedAt: timestamptz().notNull(),
  },
  (table) => [
    index('core_note_versions_note_idx').on(table.orgId, table.noteId, table.editedAt),
    foreignKey({
      columns: [table.noteId],
      foreignColumns: [notes.id],
      name: 'core_note_versions_note_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_note_versions_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/** Members' emoji reactions on timeline entries: one row per member, entry and emoji. */
export const reactions = pgTable(
  'reactions',
  {
    orgId: orgIdColumn(),
    activityId: text().notNull(),
    userId: text().notNull(),
    emoji: text().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.activityId, table.emoji, table.userId],
      name: 'core_reactions_pkey',
    }),
    foreignKey({
      columns: [table.activityId],
      foreignColumns: [activities.id],
      name: 'core_reactions_activity_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'core_reactions_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_reactions_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
