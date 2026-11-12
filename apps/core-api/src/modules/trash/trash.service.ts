import type { TrashItem } from '@erxes/core-contract';
import {
  activities,
  companyTags,
  customerTags,
  companies,
  customerCompanies,
  customers,
  type CustomValue,
  type Db,
  newId,
  tags,
  trash,
} from '@erxes/core-db';
import { and, desc, eq, getTableColumns, inArray, lt, sql } from 'drizzle-orm';
import { type Actor, type Caller, requirePermission, userCaller } from '~/http/auth';
import { pgCode } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { customFieldsColumn, saveCustomFields } from '~/modules/fields/fieldValues';
import { publishCoreEvents } from '~/modules/events/events.service';

export const TRASH_DAYS = 30;

type RecordType = 'customer' | 'company';

const tableOf = (type: RecordType) => (type === 'customer' ? customers : companies);
const tagTableOf = (type: RecordType) => (type === 'customer' ? customerTags : companyTags);

/** JSON dates back to Date for timestamp columns (and nothing else); generated columns are left to the database. */
const revive = (table: Parameters<typeof getTableColumns>[0], row: Record<string, unknown>) => {
  const columns = getTableColumns(table) as Record<
    string,
    { columnType: string; generated?: unknown }
  >;

  return Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => key in columns && !columns[key]!.generated)
      .map(([key, value]) => [
        key,
        columns[key]!.columnType === 'PgTimestamp' && typeof value === 'string'
          ? new Date(value)
          : value,
      ]),
  );
};

const labelOf = (type: RecordType, row: Record<string, unknown>) =>
  type === 'customer'
    ? [row.firstName, row.lastName].filter(Boolean).join(' ') ||
      (row.primaryEmail as string | null) ||
      (row.primaryPhone as string | null) ||
      null
    : ((row.primaryName as string | null) ?? null);

/**
 * Before deleting: the records, their tags, links and timeline go to the bin
 * (same transaction). Restorable for 30 days.
 */
export const moveToTrash = async (tx: Db, caller: Caller, type: RecordType, ids: string[]) => {
  if (!ids.length) return;

  const table = tableOf(type);
  const tagTable = tagTableOf(type);

  // Custom field values ride along in the row (`customFields`), as they did when they were a column.
  const rows = await tx
    .select({ ...getTableColumns(table), customFields: customFieldsColumn(type, table.id) })
    .from(table)
    .where(and(eq(table.orgId, caller.orgId), inArray(table.id, ids)));

  const tagRows = await tx
    .select()
    .from(tagTable)
    .where(and(eq(tagTable.orgId, caller.orgId), inArray(tagTable.recordId, ids)));

  const links = await tx
    .select()
    .from(customerCompanies)
    .where(
      and(
        eq(customerCompanies.orgId, caller.orgId),
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
        eq(activities.orgId, caller.orgId),
        eq(activities.targetType, type),
        inArray(activities.targetId, ids),
      ),
    );

  for (const row of rows) {
    const record = row as Record<string, unknown> & { id: string };

    await tx
      .insert(trash)
      .values({
        id: newId(),
        orgId: caller.orgId,
        recordType: type,
        recordId: record.id,
        label: labelOf(type, record),
        snapshot: {
          row: record,
          tagIds: tagRows.filter((tag) => tag.recordId === record.id).map((tag) => tag.tagId),
          links: links.filter(
            (link) => (type === 'customer' ? link.customerId : link.companyId) === record.id,
          ),
          activities: entries.filter((entry) => entry.targetId === record.id),
        },
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

interface Snapshot {
  row: Record<string, unknown>;
  tagIds: string[];
  links: { customerId: string; companyId: string; createdAt?: string }[];
  activities: Record<string, unknown>[];
}

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
    data: rows.map((row): TrashItem => {
      const snapshot = row.snapshot as unknown as Snapshot;

      return {
        id: row.id,
        recordType: row.recordType,
        recordId: row.recordId,
        label: row.label,
        deletedBy: { type: row.deletedByType, id: row.deletedBy },
        deletedAt: row.deletedAt.toISOString(),
        purgeAt: row.purgeAt.toISOString(),
        counts: {
          tags: snapshot.tagIds?.length ?? 0,
          links: snapshot.links?.length ?? 0,
          activities: snapshot.activities?.length ?? 0,
        },
      };
    }),
  };
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
    const type = item.recordType;
    const snapshot = item.snapshot as unknown as Snapshot;

    try {
      await client.transaction(async (tx) => {
        await tx.insert(tableOf(type)).values(revive(tableOf(type), snapshot.row) as never);

        // Values of fields deleted since are dropped.
        const customFields = (snapshot.row.customFields ?? {}) as Record<string, CustomValue>;

        await saveCustomFields(
          tx,
          actor.orgId,
          type,
          item.recordId,
          customFields,
          Object.keys(customFields),
        );

        const tagIds = snapshot.tagIds.length
          ? (
              await tx
                .select({ id: tags.id })
                .from(tags)
                .where(and(eq(tags.orgId, actor.orgId), inArray(tags.id, snapshot.tagIds)))
            ).map((tag) => tag.id)
          : [];

        if (tagIds.length) {
          await tx
            .insert(tagTableOf(type))
            .values(tagIds.map((tagId) => ({ orgId: actor.orgId, recordId: item.recordId, tagId })))
            .onConflictDoNothing();
        }

        for (const link of snapshot.links) {
          const other = type === 'customer' ? companies : customers;
          const otherId = type === 'customer' ? link.companyId : link.customerId;

          const [exists] = await tx
            .select({ id: other.id })
            .from(other)
            .where(and(eq(other.orgId, actor.orgId), eq(other.id, otherId)))
            .limit(1);

          if (exists) {
            await tx
              .insert(customerCompanies)
              .values({
                orgId: actor.orgId,
                customerId: link.customerId,
                companyId: link.companyId,
              })
              .onConflictDoNothing();
          }
        }

        if (snapshot.activities.length) {
          await tx
            .insert(activities)
            .values(snapshot.activities.map((entry) => revive(activities, entry)) as never)
            .onConflictDoNothing();
        }

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
      });
      restored += 1;
    } catch (error) {
      failed.push({
        id: item.id,
        reason:
          pgCode(error) === '23505'
            ? 'Its email or phone now belongs to another record'
            : (error as Error).message,
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
