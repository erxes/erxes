import {
  activities,
  customerCompanies,
  companies,
  customers,
  type Db,
  notes,
  noteVersions,
  reactions,
  savepoint,
  tags,
  trash,
  users,
} from '@erxes/core-db';
import { type AnyColumn, and, eq, getTableColumns, inArray, notInArray, sql } from 'drizzle-orm';
import { CasingCache } from 'drizzle-orm/casing';
import type { PgTable } from 'drizzle-orm/pg-core';
import { pgCode } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { recordAudit } from '~/modules/audit/audit.service';
import { saveCustomFields } from '~/modules/fields/fieldValues';
import { publishCoreEvents } from '~/modules/events/events.service';
import { type Snapshot, tableOf, tagTableOf, type TrashRow } from '~/modules/trash/trash.service';

/** Column names in the database, as the client spells them (`casing: 'snake_case'` in `@erxes/core-db`). */
const casing = new CasingCache('snake_case');

/** A link's key for the record itself, then for the record on the other side. */
const LINK_KEYS = {
  customer: ['customerId', 'companyId'],
  company: ['companyId', 'customerId'],
} as const;

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
  const [own, otherKey] = LINK_KEYS[type];
  const otherIdOf = (link: Snapshot['links'][number]) => link[otherKey];

  // The ids go as one jsonb parameter and `reinsert` takes one too: a company
  // may hold more links than Postgres takes parameters (65,535).
  const inIds = (column: AnyColumn, links: Snapshot['links']) =>
    sql`${column} in (select jsonb_array_elements_text(${JSON.stringify(links.map(otherIdOf))}::jsonb))`;

  if (!snapshot.links.length) return;

  const existing = new Set(
    (await tx.select({ id: other.id }).from(other).where(inIds(other.id, snapshot.links))).map(
      (row) => row.id,
    ),
  );

  const links = snapshot.links.filter((link) => existing.has(otherIdOf(link)));

  await reinsert(
    tx,
    customerCompanies,
    links.map((link) => ({ ...link, isPrimaryContact: false })),
    { skipExisting: true },
  );

  // Main contacts come back where the company took no other meanwhile. One that
  // takes one while this runs fails the restore on the unique index instead.
  const contacts = links.filter((link) => link.isPrimaryContact === true);

  if (!contacts.length) return;

  await tx
    .update(customerCompanies)
    .set({ isPrimaryContact: true })
    .where(
      and(
        eq(customerCompanies[own], recordId),
        inIds(customerCompanies[otherKey], contacts),
        notInArray(
          customerCompanies.companyId,
          tx
            .select({ id: customerCompanies.companyId })
            .from(customerCompanies)
            .where(eq(customerCompanies.isPrimaryContact, true)),
        ),
      ),
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
