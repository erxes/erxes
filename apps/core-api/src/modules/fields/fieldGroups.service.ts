import { type FieldContentType, type Db, fieldGroups, fields, newId } from '@erxes/core-db';
import { and, asc, eq, isNotNull, isNull, type SQL, sql } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { oneRow, setOrders } from '~/lib/rows';
import {
  fieldsOfGroup,
  findGroup,
  type GroupRow,
  inUse,
  nextOrder,
  requireFieldManager,
  taken,
  toFieldGroupDto,
  usageOf,
} from './fieldRows';

export const listFieldGroups = async (
  client: Db,
  actor: Actor,
  input: { contentType: FieldContentType; archived?: boolean },
) => {
  const rows = await client
    .select()
    .from(fieldGroups)
    .where(
      and(
        eq(fieldGroups.orgId, actor.orgId),
        eq(fieldGroups.contentType, input.contentType),
        input.archived ? isNotNull(fieldGroups.archivedAt) : isNull(fieldGroups.archivedAt),
      ),
    )
    .orderBy(asc(fieldGroups.order), asc(fieldGroups.createdAt));

  return { data: rows.map(toFieldGroupDto) };
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
    throw new HttpError(
      400,
      'INVALID_INPUT',
      'Code is required when the name has no Latin letters or digits',
    );
  }

  return value;
};

export const createFieldGroup = async (
  client: Db,
  actor: Actor,
  input: {
    contentType: FieldContentType;
    name: string;
    code?: string;
    description?: string | null;
  },
) => {
  requireFieldManager(actor);

  const code = groupCode(input.code, input.name);
  const order = await nextOrder(client, fieldGroups, actor.orgId, input.contentType);

  try {
    const row = oneRow(
      await client
        .insert(fieldGroups)
        .values({
          id: newId(),
          orgId: actor.orgId,
          contentType: input.contentType,
          name: input.name,
          code,
          description: input.description || null,
          order,
        })
        .returning(),
    );

    return toFieldGroupDto(row);
  } catch (error) {
    return taken(error);
  }
};

const updateGroupRow = async (
  client: Db,
  orgId: string,
  id: string,
  changes: Partial<GroupRow> | Record<string, SQL>,
) => {
  const row = oneRow(
    await client
      .update(fieldGroups)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(and(eq(fieldGroups.orgId, orgId), eq(fieldGroups.id, id)))
      .returning(),
  );

  return toFieldGroupDto(row);
};

export const updateFieldGroup = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { name?: string; code?: string; description?: string | null; order?: number },
) => {
  requireFieldManager(actor);
  await findGroup(client, actor.orgId, id);

  try {
    return await updateGroupRow(client, actor.orgId, id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
    });
  } catch (error) {
    return taken(error);
  }
};

export const reorderFieldGroups = (
  client: Db,
  actor: Actor,
  orders: { id: string; order: number }[],
) => {
  requireFieldManager(actor);

  return setOrders(client, actor.orgId, fieldGroups, orders);
};

export const archiveFieldGroup = async (client: Db, actor: Actor, id: string) => {
  requireFieldManager(actor);

  const group = await findGroup(client, actor.orgId, id);

  return group.archivedAt
    ? toFieldGroupDto(group)
    : updateGroupRow(client, actor.orgId, id, { archivedAt: sql`now()` });
};

export const restoreFieldGroup = async (client: Db, actor: Actor, id: string) => {
  requireFieldManager(actor);
  await findGroup(client, actor.orgId, id);

  return updateGroupRow(client, actor.orgId, id, { archivedAt: null });
};

/** Deletes a group and its fields when no record holds their values. */
export const removeFieldGroup = async (client: Db, actor: Actor, id: string) => {
  requireFieldManager(actor);

  return client.transaction(async (tx) => {
    await findGroup(tx, actor.orgId, id);

    const rows = await fieldsOfGroup(tx, actor.orgId, id);

    if ((await usageOf(tx, actor.orgId, rows)) > 0) {
      throw inUse('its fields');
    }

    await tx.delete(fields).where(and(eq(fields.orgId, actor.orgId), eq(fields.groupId, id)));
    await tx
      .delete(fieldGroups)
      .where(and(eq(fieldGroups.orgId, actor.orgId), eq(fieldGroups.id, id)));

    return { ok: true as const };
  });
};
