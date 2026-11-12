import type { TrashItem } from '@erxes/core-contract';
import {
  activities,
  companyTags,
  customerTags,
  companies,
  customerCompanies,
  customers,
  type Db,
  newId,
  tags,
  trash,
} from '@erxes/core-db';
import { and, desc, eq, getTableColumns, inArray, lt, sql } from 'drizzle-orm';
import { CasingCache } from 'drizzle-orm/casing';
import type { PgTable } from 'drizzle-orm/pg-core';
import { type Actor, type Caller, requirePermission, userCaller } from '~/http/auth';
import { pgCode } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { customFieldsColumn, saveCustomFields } from '~/modules/fields/fieldValues';
import { publishCoreEvents } from '~/modules/events/events.service';

export const TRASH_DAYS = 30;

type RecordType = 'customer' | 'company';

type TrashRow = typeof trash.$inferSelect;

type Snapshot = TrashRow['snapshot'];

const tableOf = (type: RecordType) => (type === 'customer' ? customers : companies);
const tagTableOf = (type: RecordType) => (type === 'customer' ? customerTags : companyTags);

const text = (value: unknown) => (typeof value === 'string' && value ? value : null);

const labelOf = (type: RecordType, row: Snapshot['row']) =>
  type === 'customer'
    ? [row.firstName, row.lastName].map(text).filter(Boolean).join(' ') ||
      text(row.primaryEmail) ||
      text(row.primaryPhone)
    : text(row.primaryName);

/** Everything that goes to the bin with each record: its tags, links and timeline. */
const companionsOf = async (tx: Db, orgId: string, type: RecordType, ids: string[]) => {
  const tagTable = tagTableOf(type);

  const tagRows = await tx
    .select()
    .from(tagTable)
    .where(and(eq(tagTable.orgId, orgId), inArray(tagTable.recordId, ids)));

  const links = await tx
    .select()
    .from(customerCompanies)
    .where(
      and(
        eq(customerCompanies.orgId, orgId),
        inArray(
          type === 'customer' ? customerCompanies.customerId : customerCompanies.companyId,
          ids,
        ),
      ),
    );

  const entries = await tx
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.orgId, orgId),
        eq(activities.targetType, type),
        inArray(activities.targetId, ids),
      ),
    );

  return (id: string): Omit<Snapshot, 'row'> => ({
    tagIds: tagRows.filter((tag) => tag.recordId === id).map((tag) => tag.tagId),
    links: links.filter((link) => (type === 'customer' ? link.customerId : link.companyId) === id),
    activities: entries.filter((entry) => entry.targetId === id),
  });
};

/**
 * Before deleting: the records, their tags, links and timeline go to the bin
 * (same transaction). Restorable for 30 days.
 */
export const moveToTrash = async (tx: Db, caller: Caller, type: RecordType, ids: string[]) => {
  if (!ids.length) return;

  const table = tableOf(type);

  // Custom field values ride along in the row (`customFields`), as they did when they were a column.
  const rows = await tx
    .select({ ...getTableColumns(table), customFields: customFieldsColumn(type, table.id) })
    .from(table)
    .where(and(eq(table.orgId, caller.orgId), inArray(table.id, ids)));

  const companions = await companionsOf(tx, caller.orgId, type, ids);

  for (const row of rows) {
    await tx
      .insert(trash)
      .values({
        id: newId(),
        orgId: caller.orgId,
        recordType: type,
        recordId: row.id,
        label: labelOf(type, row),
        snapshot: { row, ...companions(row.id) },
        deletedByType: caller.actorType,
        deletedBy: caller.actorId,
        purgeAt: sql`now() + make_interval(days => ${TRASH_DAYS})`,
      })
      .onConflictDoUpdate({
        target: [trash.orgId, trash.recordType, trash.recordId],
        set: {
          snapshot: sql`excluded.snapshot`,
          deletedAt: sql`now()`,
          purgeAt: sql`excluded.purge_at`,
        },
      });
  }
};

export const listTrash = async (
  client: Db,
  actor: Actor,
  query: { type?: RecordType; limit: number },
) => {
  requirePermission(actor, 'contacts.delete');

  const rows = await client
    .select()
    .from(trash)
    .where(
      and(eq(trash.orgId, actor.orgId), query.type ? eq(trash.recordType, query.type) : undefined),
    )
    .orderBy(desc(trash.deletedAt))
    .limit(query.limit);

  return {
    data: rows.map(
      (row): TrashItem => ({
        id: row.id,
        recordType: row.recordType,
        recordId: row.recordId,
        label: row.label,
        deletedBy: { type: row.deletedByType, id: row.deletedBy },
        deletedAt: row.deletedAt.toISOString(),
        purgeAt: row.purgeAt.toISOString(),
        counts: {
          tags: row.snapshot.tagIds.length,
          links: row.snapshot.links.length,
          activities: row.snapshot.activities.length,
        },
      }),
    ),
  };
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
  rows: Snapshot['activities'],
  options: { skipExisting: boolean },
) => {
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
const restoreRelations = async (tx: Db, orgId: string, item: TrashRow) => {
  const { snapshot, recordId } = item;
  const type = item.recordType;

  const tagIds = snapshot.tagIds.length
    ? (
        await tx
          .select({ id: tags.id })
          .from(tags)
          .where(and(eq(tags.orgId, orgId), inArray(tags.id, snapshot.tagIds)))
      ).map((tag) => tag.id)
    : [];

  if (tagIds.length) {
    await tx
      .insert(tagTableOf(type))
      .values(tagIds.map((tagId) => ({ orgId, recordId, tagId })))
      .onConflictDoNothing();
  }

  const other = type === 'customer' ? companies : customers;

  for (const link of snapshot.links) {
    const otherId = type === 'customer' ? link.companyId : link.customerId;

    const [exists] = await tx
      .select({ id: other.id })
      .from(other)
      .where(and(eq(other.orgId, orgId), eq(other.id, otherId)))
      .limit(1);

    if (exists) {
      await tx
        .insert(customerCompanies)
        .values({ orgId, customerId: link.customerId, companyId: link.companyId })
        .onConflictDoNothing();
    }
  }
};

/** One record back, with its custom field values (of fields still existing), relations and timeline. */
const restoreItem = async (tx: Db, actor: Actor, item: TrashRow) => {
  const type = item.recordType;
  const { row, activities: entries } = item.snapshot;

  await reinsert(tx, tableOf(type), [row], { skipExisting: false });

  const customFields = row.customFields ?? {};

  await saveCustomFields(tx, actor.orgId, type, item.recordId, customFields, Object.keys(customFields));
  await restoreRelations(tx, actor.orgId, item);

  if (entries.length) await reinsert(tx, activities, entries, { skipExisting: true });

  await tx.delete(trash).where(eq(trash.id, item.id));
  await publishCoreEvents(tx, userCaller(actor), {
    type: `core.${type}.restored`,
    subject: { type, id: item.recordId },
  });
  await recordAudit(tx, userCaller(actor), {
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
export const restoreFromTrash = async (client: Db, actor: Actor, ids: string[]) => {
  requirePermission(actor, 'contacts.delete');

  const items = await client
    .select()
    .from(trash)
    .where(and(eq(trash.orgId, actor.orgId), inArray(trash.id, ids)));

  const failed: { id: string; reason: string }[] = [];
  let restored = 0;

  for (const item of items) {
    try {
      await client.transaction((tx) => restoreItem(tx, actor, item));
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
  }

  return { restored, failed };
};

/** Gone for good now (privacy requests). Owners only. */
export const purgeFromTrash = async (client: Db, actor: Actor, ids: string[]) => {
  requirePermission(actor, 'trash.purge');

  const removed = await client
    .delete(trash)
    .where(and(eq(trash.orgId, actor.orgId), inArray(trash.id, ids)))
    .returning({ recordType: trash.recordType, recordId: trash.recordId, label: trash.label });

  if (removed.length) {
    await recordAudit(
      client,
      userCaller(actor),
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
