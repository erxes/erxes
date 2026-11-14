import type { CursorQuery } from '@erxes/core-contract';
import {
  type ContentType,
  activities,
  actorOf,
  caller,
  companyTags,
  customerTags,
  companies,
  customerCompanies,
  customers,
  type Db,
  newId,
  notes,
  noteVersions,
  reactions,
  trash,
} from '@erxes/core-db';
import { and, eq, getTableColumns, inArray, lt, sql } from 'drizzle-orm';
import { keysetPage } from '~/lib/keyset';
import { recordAudit } from '~/modules/audit/audit.service';
import { customFieldsColumn } from '~/modules/fields/fieldValues';

const TRASH_DAYS = 30;

export type TrashRow = typeof trash.$inferSelect;

export type Snapshot = TrashRow['snapshot'];

export const tableOf = (type: ContentType) => (type === 'customer' ? customers : companies);
export const tagTableOf = (type: ContentType) => (type === 'customer' ? customerTags : companyTags);

const text = (value: unknown) => (typeof value === 'string' && value ? value : null);

const labelOf = (type: ContentType, row: Snapshot['row']) =>
  type === 'customer'
    ? [row.firstName, row.lastName].map(text).filter(Boolean).join(' ') ||
      text(row.primaryEmail) ||
      text(row.primaryPhone)
    : text(row.primaryName);

/** Everything that goes to the bin with each record: its tags, links and timeline. */
const companionsOf = async (tx: Db, type: ContentType, ids: string[]) => {
  const tagTable = tagTableOf(type);

  const tagRows = await tx.select().from(tagTable).where(inArray(tagTable.recordId, ids));

  const links = await tx
    .select()
    .from(customerCompanies)
    .where(
      inArray(
        type === 'customer' ? customerCompanies.customerId : customerCompanies.companyId,
        ids,
      ),
    );

  const timeline = and(eq(activities.targetType, type), inArray(activities.targetId, ids));
  const entryIds = tx.select({ id: activities.id }).from(activities).where(timeline);

  const entries = await tx.select().from(activities).where(timeline);
  const noteRows = await tx.select().from(notes).where(inArray(notes.id, entryIds));

  const versions = await tx
    .select()
    .from(noteVersions)
    .where(inArray(noteVersions.noteId, entryIds));

  const reacted = await tx.select().from(reactions).where(inArray(reactions.activityId, entryIds));
  const recordOf = new Map(entries.map((entry) => [entry.id, entry.targetId]));

  return (id: string): Omit<Snapshot, 'row'> => ({
    tagIds: tagRows.filter((tag) => tag.recordId === id).map((tag) => tag.tagId),
    links: links.filter((link) => (type === 'customer' ? link.customerId : link.companyId) === id),
    activities: entries.filter((entry) => entry.targetId === id),
    notes: noteRows.filter((note) => recordOf.get(note.id) === id),
    noteVersions: versions.filter((version) => recordOf.get(version.noteId) === id),
    reactions: reacted.filter((reaction) => recordOf.get(reaction.activityId) === id),
  });
};

/**
 * Before deleting: the records, their tags, links and timeline go to the bin
 * (same transaction). Restorable for 30 days.
 */
export const moveToTrash = async (tx: Db, type: ContentType, ids: string[]) => {
  if (!ids.length) return;

  const table = tableOf(type);

  // Custom field values ride along in the row (`customFields`), as they did when they were a column.
  const rows = await tx
    .select({ ...getTableColumns(table), customFields: customFieldsColumn(type, table.id) })
    .from(table)
    .where(inArray(table.id, ids));

  if (!rows.length) return;

  const by = actorOf(caller());
  const companions = await companionsOf(tx, type, ids);

  await tx
    .insert(trash)
    .values(
      rows.map((row) => ({
        id: newId(),
        recordType: type,
        recordId: row.id,
        label: labelOf(type, row),
        snapshot: { row, ...companions(row.id) },
        deletedByType: by.actorType,
        deletedBy: by.actorId,
        purgeAt: sql`now() + make_interval(days => ${TRASH_DAYS})`,
      })),
    )
    .onConflictDoUpdate({
      target: [trash.orgId, trash.recordType, trash.recordId],
      set: {
        snapshot: sql`excluded.snapshot`,
        deletedAt: sql`now()`,
        purgeAt: sql`excluded.purge_at`,
      },
    });
};

export const listTrash = async (client: Db, query: CursorQuery & { type?: ContentType }) => {
  const { snapshot, ...columns } = getTableColumns(trash);

  const countOf = (key: keyof Snapshot) =>
    sql<number>`jsonb_array_length(${snapshot} -> ${key})`.mapWith(Number);

  // A record deleted again moves to the top: `deletedAt` is the position.
  return keysetPage(
    client,
    { table: trash, id: trash.id, createdAt: trash.deletedAt },
    query.type ? eq(trash.recordType, query.type) : undefined,
    query,
    (where, orderBy, limit) =>
      client
        .select({
          ...columns,
          counts: {
            tags: countOf('tagIds'),
            links: countOf('links'),
            activities: countOf('activities'),
          },
        })
        .from(trash)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );
};

/** Gone for good now (privacy requests). Owners only. */
export const purgeFromTrash = async (client: Db, ids: string[]) => {
  const removed = await client
    .delete(trash)
    .where(inArray(trash.id, ids))
    .returning({ recordType: trash.recordType, recordId: trash.recordId, label: trash.label });

  if (removed.length) {
    await recordAudit(
      client,
      removed.map((row) => ({
        action: `${row.recordType}.purged`,
        targetType: row.recordType,
        targetId: row.recordId,
        targetLabel: row.label,
      })),
    );
  }

  return { purged: removed.length };
};

/** Housekeeping (system scope): what has been in the bin 30 days goes. */
export const purgeExpiredTrash = async (client: Db) => {
  const result = await client.delete(trash).where(lt(trash.purgeAt, sql`now()`));

  return result.rowCount ?? 0;
};
