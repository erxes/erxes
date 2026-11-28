import { type coreContract, isCoreFieldType } from '@erxes/core-contract';
import type { InferContractRouterInputs } from '@orpc/contract';
import { type PropertyContentType, type Db, fieldGroups, fields, newId } from '@erxes/core-db';
import { and, asc, eq, isNotNull, isNull, type SQL, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { fail } from '~/http/errors';
import { oneRow, setOrders } from '~/lib/rows';
import {
  assertPluginReads,
  assertPropertyType,
  fieldsOfGroup,
  findGroup,
  type GroupRow,
  inUse,
  nextOrder,
  usageOf,
} from './fieldRows';

export const listFieldGroups = async (
  client: Db,
  input: { contentType: PropertyContentType; archived?: boolean },
) => {
  assertPluginReads(input.contentType);

  const rows = await wholeList((limit) =>
    client
      .select()
      .from(fieldGroups)
      .where(
        and(
          eq(fieldGroups.contentType, input.contentType),
          input.archived ? isNotNull(fieldGroups.archivedAt) : isNull(fieldGroups.archivedAt),
        ),
      )
      .orderBy(asc(fieldGroups.order), asc(fieldGroups.createdAt))
      .limit(limit),
  );

  return { data: rows };
};

/** A code from a name: lower-case Latin letters and digits joined by `_`. */
const codeOf = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const groupCode = (code: string | undefined, name: string) => {
  const value = code?.trim() || codeOf(name);

  if (!value) {
    throw fail('INVALID_INPUT', 'Code is required when the name has no Latin letters or digits', {
      issues: [
        {
          path: ['code'],
          message: 'Code is required when the name has no Latin letters or digits',
        },
      ],
    });
  }

  return value;
};

/** `appliesTo` limits a plugin type's group to some of its records; core's records take none. */
const assertAppliesTo = (
  contentType: PropertyContentType,
  appliesTo: Record<string, string[]> | undefined,
  groupId = '',
) => {
  const limits = Object.values(appliesTo ?? {}).some((ids) => ids.length > 0);

  if (limits && isCoreFieldType(contentType)) {
    throw fail(
      'INVALID_FIELD_GROUP',
      'Only a plugin record type’s groups apply to some records',
      groupId ? { groupId } : undefined,
    );
  }
};

export const createFieldGroup = async (
  client: Db,
  input: InferContractRouterInputs<typeof coreContract>['fieldGroups']['create'],
) => {
  await assertPropertyType(client, input.contentType);
  assertAppliesTo(input.contentType, input.appliesTo);

  const code = groupCode(input.code, input.name);
  const order = await nextOrder(client, fieldGroups, input.contentType);

  const row = oneRow(
    await client
      .insert(fieldGroups)
      .values({
        id: newId(),
        contentType: input.contentType,
        name: input.name,
        code,
        description: input.description || null,
        appliesTo: input.appliesTo,
        order,
      })
      .returning(),
  );

  return row;
};

const updateGroupRow = async (
  client: Db,
  id: string,
  changes: Partial<GroupRow> | Record<string, SQL>,
) => {
  const row = oneRow(
    await client
      .update(fieldGroups)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(eq(fieldGroups.id, id))
      .returning(),
  );

  return row;
};

export const updateFieldGroup = async (
  client: Db,
  id: string,
  {
    description,
    ...rest
  }: Omit<InferContractRouterInputs<typeof coreContract>['fieldGroups']['update'], 'id'>,
) => {
  const group = await findGroup(client, id);

  assertAppliesTo(group.contentType, rest.appliesTo, id);

  return updateGroupRow(client, id, {
    ...rest,
    description: description === '' ? null : description,
  });
};

export const reorderFieldGroups = (client: Db, orders: { id: string; order: number }[]) =>
  setOrders(client, fieldGroups, orders);

export const archiveFieldGroup = async (client: Db, id: string) => {
  const group = await findGroup(client, id);

  return group.archivedAt ? group : updateGroupRow(client, id, { archivedAt: sql`now()` });
};

export const restoreFieldGroup = async (client: Db, id: string) => {
  await findGroup(client, id);

  return updateGroupRow(client, id, { archivedAt: null });
};

/** Deletes a group and its fields when no record holds their values. */
export const removeFieldGroup = async (client: Db, id: string) => {
  await findGroup(client, id);

  const rows = await fieldsOfGroup(client, id);

  if ((await usageOf(client, rows)) > 0) {
    throw inUse('its fields');
  }

  await client.delete(fields).where(eq(fields.groupId, id));
  await client.delete(fieldGroups).where(eq(fieldGroups.id, id));

  return { ok: true as const };
};
