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
  savepoint,
  tags,
  trash,
  users,
} from '@erxes/core-db';
import { and, eq, getTableColumns, inArray, lt, sql } from 'drizzle-orm';
import { CasingCache } from 'drizzle-orm/casing';
import type { PgTable } from 'drizzle-orm/pg-core';
import { pgCode } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { inOrder } from '~/lib/sequence';
import { recordAudit } from '~/modules/audit/audit.service';
import { customFieldsColumn, saveCustomFields } from '~/modules/fields/fieldValues';
import { publishCoreEvents } from '~/modules/events/events.service';

const TRASH_DAYS = 30;

type TrashRow = typeof trash.$inferSelect;

type Snapshot = TrashRow['snapshot'];

const tableOf = (type: ContentType) => (type === 'customer' ? customers : companies);
const tagTableOf = (type: ContentType) => (type === 'customer' ? customerTags : companyTags);

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

/** Column names in the database, as the client spells them (`casing: 'snake_case'` in `@erxes/core-db`). */
const casing = new CasingCache('snake_case');

/**
 * Inserts snapshot rows again: Postgres reads each column from its JSON value
 * (ISO dates, arrays, jsonb). Keys that are no column (`customFields`) and
 * generated columns are left out; columns added since keep their defaults.
 */
const reinsert = async (
  tx: Db,
  table: PgTable,
  rows: Record<string, unknown>[],
  options: { skipExisting: boolean },
) => {
  if (!rows.length) return;

  const columns = Object.entries(getTableColumns(table)).flatMap(([key, column]) =>
    column.generated || !rows.some((row) => key in row)
      ? []
      : [{ key, name: casing.getColumnCasing(column) }],
  );

  const names = sql.join(
    columns.map((column) => sql.identifier(column.name)),
    sql`, `,
  );

  const values = rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column.name, row[column.key]])),
  );

  await tx.execute(
    sql`insert into ${table} (${names}) select ${names} from jsonb_populate_recordset(null::${table}, ${JSON.stringify(values)}::jsonb)${options.skipExisting ? sql` on conflict do nothing` : sql``}`,
  );
};

/** The tags (those still existing) and links (to records still existing) of a restored record. */
const restoreRelations = async (tx: Db, item: TrashRow) => {
  const { snapshot, recordId } = item;
  const type = item.recordType;

  const tagIds = snapshot.tagIds.length
    ? (await tx.select({ id: tags.id }).from(tags).where(inArray(tags.id, snapshot.tagIds))).map(
        (tag) => tag.id,
      )
    : [];

  if (tagIds.length) {
    await tx
      .insert(tagTableOf(type))
      .values(tagIds.map((tagId) => ({ recordId, tagId })))
      .onConflictDoNothing();
  }

  const other = type === 'customer' ? companies : customers;

  const otherIdOf = (link: Snapshot['links'][number]) =>
    type === 'customer' ? link.companyId : link.customerId;

  if (!snapshot.links.length) return;

  // The ids go as one jsonb parameter and `reinsert` takes one too: a company
  // may hold more links than Postgres takes parameters (65,535).
  const existing = new Set(
    (
      await tx
        .select({ id: other.id })
        .from(other)
        .where(
          sql`${other.id} in (select jsonb_array_elements_text(${JSON.stringify(snapshot.links.map(otherIdOf))}::jsonb))`,
        )
    ).map((row) => row.id),
  );

  await reinsert(
    tx,
    customerCompanies,
    snapshot.links.flatMap((link) =>
      existing.has(otherIdOf(link))
        ? [{ customerId: link.customerId, companyId: link.companyId }]
        : [],
    ),
    { skipExisting: true },
  );
};

/** Reactions come back from the members still on the team. */
const restoreReactions = async (tx: Db, rows: Snapshot['reactions']) => {
  if (!rows.length) return;

  const members = new Set(
    (
      await tx
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.id, [...new Set(rows.map((row) => row.userId))]))
    ).map((member) => member.id),
  );

  await reinsert(
    tx,
    reactions,
    rows.filter((row) => members.has(row.userId)),
    { skipExisting: true },
  );
};

/** One record back, with its custom field values (of fields still existing), relations and timeline. */
const restoreItem = async (tx: Db, item: TrashRow) => {
  const type = item.recordType;
  const { row, activities: entries, notes: noteRows, noteVersions: versions } = item.snapshot;

  await reinsert(tx, tableOf(type), [row], { skipExisting: false });

  const customFields = row.customFields ?? {};

  await saveCustomFields(tx, type, item.recordId, customFields, Object.keys(customFields));
  await restoreRelations(tx, item);

  await reinsert(tx, activities, entries, { skipExisting: true });
  await reinsert(tx, notes, noteRows, { skipExisting: true });
  await reinsert(tx, noteVersions, versions, { skipExisting: true });
  await restoreReactions(tx, item.snapshot.reactions);

  await tx.delete(trash).where(eq(trash.id, item.id));
  await publishCoreEvents(tx, {
    type: `core.${type}.restored`,
    subjectType: type,
    subjectId: item.recordId,
  });
  await recordAudit(tx, {
    action: `${type}.restored`,
    targetType: type,
    targetId: item.recordId,
    targetLabel: item.label,
  });
};

/**
 * Brings records back: the row, its tags (those still existing), its links
 * (to records still existing) and its timeline. Each in its own savepoint: one
 * whose email is taken by now fails alone.
 */
export const restoreFromTrash = async (client: Db, ids: string[]) => {
  const items = await client.select().from(trash).where(inArray(trash.id, ids));

  const failed: { id: string; reason: string }[] = [];
  let restored = 0;

  // One savepoint after another on the request's connection, so each item fails alone.
  await inOrder(items, async (item) => {
    try {
      await savepoint((tx) => restoreItem(tx, item));
      restored += 1;
    } catch (error) {
      failed.push({
        id: item.id,
        reason:
          pgCode(error) === '23505'
            ? 'Its email or phone now belongs to another record'
            : error instanceof Error
              ? error.message
              : 'It could not be restored',
      });
    }
  });

  return { restored, failed };
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
