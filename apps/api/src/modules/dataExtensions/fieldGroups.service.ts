import { type Db, dataFieldGroups, dataFields, newId } from '@erxes/core-db';
import { and, asc, count, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { pluginOf } from './columns';
import { assertPluginReads, extendableType } from './fieldRules';

/**
 * Field groups: the sections a record type's fields show under. Archiving one hides it and its
 * fields (`activeField`); their values stay. Only an empty group is deleted.
 */

type AppliesTo = Record<string, string[]>;

/** 400 INVALID_FIELD_GROUP for `appliesTo` on core's or a custom object's records. */
const assertAppliesTo = (recordType: string, appliesTo: AppliesTo | undefined) => {
  if (appliesTo && Object.keys(appliesTo).length && !pluginOf(recordType)) {
    throw fail('INVALID_FIELD_GROUP', 'Only a plugin’s record type has groups for some records');
  }
};

const findGroup = async (client: Db, id: string) => {
  const [row] = await client
    .select()
    .from(dataFieldGroups)
    .where(eq(dataFieldGroups.id, id))
    .limit(1);

  if (!row) throw notFound('Field group');

  return row;
};

/** 400 INVALID_REFERENCE unless the group is one of the record type's. */
export const assertGroupOf = async (client: Db, recordType: string, groupId: string) => {
  const [row] = await client
    .select({ id: dataFieldGroups.id })
    .from(dataFieldGroups)
    .where(and(eq(dataFieldGroups.id, groupId), eq(dataFieldGroups.recordType, recordType)))
    .limit(1);

  if (!row) {
    throw fail('INVALID_REFERENCE', `${groupId} is not a group of ${recordType}`, {
      field: 'groupId',
    });
  }
};

export const listGroups = async (client: Db, recordType: string, archived = false) => {
  assertPluginReads(recordType);
  await extendableType(client, recordType);

  const rows = await wholeList((limit) =>
    client
      .select()
      .from(dataFieldGroups)
      .where(
        and(
          eq(dataFieldGroups.recordType, recordType),
          archived ? isNotNull(dataFieldGroups.archivedAt) : isNull(dataFieldGroups.archivedAt),
        ),
      )
      .orderBy(asc(dataFieldGroups.position), asc(dataFieldGroups.createdAt))
      .limit(limit),
  );

  return { data: rows };
};

export const createGroup = async (
  client: Db,
  input: {
    recordType: string;
    label: string;
    code: string;
    description?: string;
    appliesTo?: AppliesTo;
  },
) => {
  await extendableType(client, input.recordType);
  assertAppliesTo(input.recordType, input.appliesTo);

  const [last] = await client
    .select({ next: sql<number>`coalesce(max(${dataFieldGroups.position}) + 1, 0)::int` })
    .from(dataFieldGroups)
    .where(eq(dataFieldGroups.recordType, input.recordType));

  return oneRow(
    await client
      .insert(dataFieldGroups)
      .values({ ...input, id: newId(), position: last?.next ?? 0 })
      .returning(),
  );
};

export const updateGroup = async (
  client: Db,
  {
    id,
    ...input
  }: {
    id: string;
    label?: string;
    code?: string;
    description?: string | null;
    appliesTo?: AppliesTo;
  },
) => {
  const group = await findGroup(client, id);

  assertAppliesTo(group.recordType, input.appliesTo);

  return oneRow(
    await client
      .update(dataFieldGroups)
      .set({ ...input, updatedAt: sql`now()` })
      .where(eq(dataFieldGroups.id, id))
      .returning(),
  );
};

/** Puts a record type's groups in the order of `ids`; groups it leaves out keep theirs after. */
export const reorderGroups = async (client: Db, recordType: string, ids: string[]) => {
  await extendableType(client, recordType);

  const unique = [...new Set(ids)];

  await client
    .update(dataFieldGroups)
    .set({
      position: sql`case ${sql.join(
        unique.map((id, index) => sql`when ${dataFieldGroups.id} = ${id} then ${index}::int`),
        sql` `,
      )} else ${dataFieldGroups.position} + ${unique.length} end`,
      updatedAt: sql`now()`,
    })
    .where(eq(dataFieldGroups.recordType, recordType));

  return listGroups(client, recordType);
};

/** Archives a group, which hides its fields, or brings it back with them. */
export const setGroupArchived = async (client: Db, id: string, archived: boolean) => {
  const group = await findGroup(client, id);

  if (!archived) await extendableType(client, group.recordType);

  return oneRow(
    await client
      .update(dataFieldGroups)
      .set({ archivedAt: archived ? sql`now()` : null, updatedAt: sql`now()` })
      .where(eq(dataFieldGroups.id, id))
      .returning(),
  );
};

/** Deletes an empty group: 409 GROUP_IN_USE while a field, archived ones too, is in it. */
export const removeGroup = async (client: Db, id: string) => {
  const group = await findGroup(client, id);

  const [used] = await client
    .select({ total: count() })
    .from(dataFields)
    .where(eq(dataFields.groupId, id));

  const total = used?.total ?? 0;

  if (total) {
    throw fail('GROUP_IN_USE', `${group.label} has ${total} fields: move or delete them first`, {
      count: total,
    });
  }

  await client.delete(dataFieldGroups).where(eq(dataFieldGroups.id, id));

  return { id };
};
