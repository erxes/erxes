import { type CursorQuery, DataExtensionValueChange } from '@erxes/core-contract';
import { activities, type Db, users } from '@erxes/core-db';
import { and, eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { keysetPage } from '~/lib/keyset';
import { recordActivity } from '~/modules/activities/activities.service';
import { assertRecordRight, findRecordType } from '~/modules/recordTypes/recordTypes.service';
import { isComputed } from './columns';
import { type DataFieldRow, fieldsById, qualified, tableOf } from './definitions';
import { canViewField, fieldsRuled } from './fieldAccess';
import { assertRecordsExist } from './references';

/**
 * A record's value history, kept on its timeline (`core_activities`): customers' and
 * companies' changes show on their own timelines, other records' under their record type. An
 * entry keeps each field's key, label and type as they were, so renames don't rewrite it.
 */

const KINDS = { created: 'data.record.created', updated: 'data.values.changed' } as const;

const Changes = z.object({ changes: z.array(DataExtensionValueChange) });

const isRecordType = (value: string): value is `${string}.${string}` => value.includes('.');

/** The timeline a record type's history goes on. */
const targetOf = (recordType: string) => {
  if (recordType === 'core.customer') return 'customer';

  if (recordType === 'core.company') return 'company';

  if (!isRecordType(recordType)) throw new Error(`${recordType} is not a record type`);

  return recordType;
};

/** Values a member writes: computed ones and auto numbers aren't history. */
const written = (field: DataFieldRow) => !isComputed(field.type) && field.type !== 'autoNumber';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Adds an entry for the values a write changed (`before` null: a new record), in the write's
 * transaction. Nothing when no value changed.
 */
export const recordChanges = async (
  client: Db,
  input: {
    recordType: string;
    recordId: string;
    fields: DataFieldRow[];
    before: Record<string, unknown> | null;
    after: Record<string, unknown>;
  },
) => {
  const changes = input.fields.filter(written).flatMap((field) => {
    const from = input.before?.[field.key] ?? null;
    const to = input.after[field.key] ?? null;

    return same(from, to)
      ? []
      : [{ fieldId: field.id, key: field.key, label: field.label, type: field.type, from, to }];
  });

  if (!changes.length) return;

  await recordActivity(client, {
    targetType: targetOf(input.recordType),
    targetId: input.recordId,
    type: input.before ? KINDS.updated : KINDS.created,
    data: Changes.parse({ changes }),
  });
};

/** Value history entries of a record type's records: these ones, or all with `ids` left out. */
const historyOf = (recordType: string, ids?: string[]) =>
  and(
    eq(activities.targetType, targetOf(recordType)),
    ids ? inArray(activities.targetId, ids) : undefined,
    eq(activities.source, 'core'),
    inArray(activities.type, Object.values(KINDS)),
  );

/** Removes these records' value history (their other timeline entries stay). */
export const removeHistory = async (client: Db, recordType: string, ids: string[]) => {
  if (ids.length) await client.delete(activities).where(historyOf(recordType, ids));
};

/** Removes the value history of a custom object's records no longer in its table (purged). */
export const removeOrphanHistory = async (client: Db, recordType: string) => {
  const table = await tableOf(client, recordType);

  if (!table) return;

  await client
    .delete(activities)
    .where(
      and(
        historyOf(recordType),
        sql`not exists (select 1 from ${qualified(table)} r where r.id = ${activities.targetId})`,
      ),
    );
};

/** The changes the caller may see: none to a field they can't, or to one that's gone when fields are ruled for them. */
const visibleChanges = async (client: Db, entries: { data: Record<string, unknown> }[]) => {
  const parsed = entries.map((entry) => Changes.safeParse(entry.data).data?.changes ?? []);

  const fields = await fieldsById(client, [
    ...new Set(parsed.flat().map((change) => change.fieldId)),
  ]);

  const seen = new Map(fields.map((field) => [field.id, canViewField(field)]));
  const ruled = fieldsRuled();

  return parsed.map((changes) => changes.filter((change) => seen.get(change.fieldId) ?? !ruled));
};

const HISTORY_TYPES: ReadonlySet<string> = new Set(Object.values(KINDS));

/** Timeline entries with the value changes the caller can't see taken out of the history ones. */
export const visibleEntries = async <T extends { type: string; data: Record<string, unknown> }>(
  client: Db,
  entries: T[],
) => {
  if (!fieldsRuled() || !entries.some((entry) => HISTORY_TYPES.has(entry.type))) return entries;

  const changes = await visibleChanges(client, entries);

  return entries.map((entry, index) =>
    HISTORY_TYPES.has(entry.type)
      ? { ...entry, data: { ...entry.data, changes: changes[index] ?? [] } }
      : entry,
  );
};

/**
 * A record's value history, newest first: 403 without the record type's read right, 400
 * INVALID_REFERENCE for a record that isn't there (as `dataValues.get`).
 */
export const listHistory = async (
  client: Db,
  input: CursorQuery & { recordType: string; recordId: string },
) => {
  assertRecordRight(await findRecordType(client, input.recordType), 'read');
  await assertRecordsExist(client, input.recordType, [input.recordId], 'recordId');

  const page = await keysetPage(
    client,
    {
      table: activities,
      id: activities.id,
      createdAt: activities.occurredAt,
      scope: historyOf(input.recordType, [input.recordId]),
    },
    undefined,
    input,
    (where, orderBy, limit) =>
      client
        .select({
          ...getTableColumns(activities),
          actorName: sql<string | null>`coalesce(nullif(${users.fullName}, ''), ${users.email})`,
        })
        .from(activities)
        .leftJoin(users, and(eq(activities.actorType, 'user'), eq(users.id, activities.actorId)))
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  const changes = await visibleChanges(client, page.data);

  return {
    ...page,
    data: page.data.map((entry, index) => ({
      ...entry,
      kind: entry.type === KINDS.created ? ('created' as const) : ('updated' as const),
      changes: changes[index] ?? [],
    })),
  };
};
