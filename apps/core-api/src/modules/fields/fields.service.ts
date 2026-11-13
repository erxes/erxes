import { FIELD_TYPE_FAMILIES } from '@erxes/core-contract';
import { type FieldContentType, type Db, fieldGroups, fields, newId } from '@erxes/core-db';
import { and, asc, eq, inArray, isNotNull, isNull, or, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import type { Actor, Caller } from '~/http/auth';
import { forbidden, HttpError, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { lockRows } from '~/lib/locks';
import { oneRow, setOrders } from '~/lib/rows';
import {
  type FieldRow,
  type FieldType,
  fieldsOfGroup,
  findGroup,
  hasOptions,
  inUse,
  nextOrder,
  optionCounts,
  requireFieldManager,
  taken,
  toFieldDto,
  usageOf,
} from './fieldRows';

type FieldValidation = NonNullable<FieldRow['validation']>;

const TEXT_TYPES: readonly FieldType[] = ['text', 'textarea'];

const sameFamily = (from: FieldType, to: FieldType) =>
  from === to || FIELD_TYPE_FAMILIES.some((family) => family.includes(from) && family.includes(to));

const findField = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(fields)
    .where(and(eq(fields.orgId, orgId), eq(fields.id, id)))
    .limit(1);

  if (!row) {
    throw notFound('Field');
  }

  return row;
};

/** A group a field of `contentType` may be put in: same organisation and type, not archived. */
const checkGroup = async (
  client: Db,
  orgId: string,
  contentType: FieldContentType,
  groupId: string | null | undefined,
) => {
  if (!groupId) {
    return;
  }

  const [group] = await client
    .select()
    .from(fieldGroups)
    .where(and(eq(fieldGroups.orgId, orgId), eq(fieldGroups.id, groupId)))
    .limit(1);

  if (!group || group.contentType !== contentType || group.archivedAt) {
    throw new HttpError(400, 'INVALID_FIELD_GROUP', `Not an active ${contentType} field group`, {
      groupId,
    });
  }
};

const groupArchivedAt = async (client: Db, groupId: string | null) => {
  if (!groupId) {
    return null;
  }

  const [group] = await client
    .select({ archivedAt: fieldGroups.archivedAt })
    .from(fieldGroups)
    .where(eq(fieldGroups.id, groupId))
    .limit(1);

  return group?.archivedAt ?? null;
};

/** A field with its group's archive date, as the list shows it. */
const fieldDto = async (client: Db, row: FieldRow) =>
  toFieldDto(row, await groupArchivedAt(client, row.groupId));

export const listFields = async (
  client: Db,
  caller: Caller,
  input: { contentType: FieldContentType; groupId?: string; archived?: boolean },
) => {
  // Plugins read product fields (with products:read) to show product values; contacts' fields stay members'.
  if (caller.actorType === 'plugin' && input.contentType !== 'product') {
    throw forbidden('FORBIDDEN', 'Plugins read product fields only');
  }

  const archived = or(isNotNull(fields.archivedAt), isNotNull(fieldGroups.archivedAt));
  const active = and(isNull(fields.archivedAt), isNull(fieldGroups.archivedAt));

  const rows = await wholeList((limit) =>
    client
      .select({ field: fields, groupArchivedAt: fieldGroups.archivedAt })
      .from(fields)
      .leftJoin(fieldGroups, eq(fieldGroups.id, fields.groupId))
      .where(
        and(
          eq(fields.orgId, caller.orgId),
          eq(fields.contentType, input.contentType),
          input.groupId ? eq(fields.groupId, input.groupId) : undefined,
          input.archived ? archived : active,
        ),
      )
      .orderBy(asc(fields.order), asc(fields.createdAt))
      .limit(limit),
  );

  return { data: rows.map((row) => toFieldDto(row.field, row.groupArchivedAt)) };
};

export const fieldUsage = async (
  client: Db,
  actor: Actor,
  input: { ids?: string[]; groupId?: string },
) => {
  const rows = input.groupId
    ? await fieldsOfGroup(
        client,
        actor.orgId,
        (await findGroup(client, actor.orgId, input.groupId)).id,
      )
    : await client
        .select()
        .from(fields)
        .where(and(eq(fields.orgId, actor.orgId), inArray(fields.id, input.ids ?? [])));

  const records = await usageOf(client, actor.orgId, rows);

  const options =
    records > 0
      ? await optionCounts(
          client,
          actor.orgId,
          rows.filter((field) => hasOptions(field.type)),
        )
      : {};

  return { records, options, removable: records === 0 };
};

export const createField = async (
  client: Db,
  actor: Actor,
  input: {
    contentType: FieldContentType;
    label: string;
    type: FieldType;
    options?: string[];
    groupId?: string | null;
    code?: string | null;
    description?: string | null;
    icon?: string | null;
    validation?: FieldValidation | null;
    isVisible?: boolean;
  },
) => {
  requireFieldManager(actor);
  await checkGroup(client, actor.orgId, input.contentType, input.groupId);

  const order = await nextOrder(client, fields, actor.orgId, input.contentType);

  try {
    const row = oneRow(
      await client
        .insert(fields)
        .values({
          id: newId(),
          orgId: actor.orgId,
          contentType: input.contentType,
          groupId: input.groupId ?? null,
          label: input.label,
          code: input.code || null,
          description: input.description || null,
          icon: input.icon || null,
          type: input.type,
          validation: TEXT_TYPES.includes(input.type) ? (input.validation ?? null) : null,
          options: hasOptions(input.type) ? unique(input.options ?? []) : [],
          isVisible: input.isVisible ?? true,
          order,
        })
        .returning(),
    );

    return toFieldDto(row);
  } catch (error) {
    return taken(error);
  }
};

interface FieldChanges {
  label?: string;
  type?: FieldType;
  options?: string[];
  order?: number;
  groupId?: string | null;
  code?: string | null;
  description?: string | null;
  icon?: string | null;
  validation?: FieldValidation | null;
  isVisible?: boolean;
}

/** The type, options and validation a field ends up with; a type change must keep stored values readable. */
const typeChange = async (client: Db, orgId: string, field: FieldRow, input: FieldChanges) => {
  const type = input.type ?? field.type;

  if (!sameFamily(field.type, type) && (await usageOf(client, orgId, [field])) > 0) {
    throw new HttpError(
      409,
      'FIELD_IN_USE',
      'Records hold values of this field, so it can only change to a type with the same stored value',
      { fieldId: field.id },
    );
  }

  const options = hasOptions(type) ? unique(input.options ?? field.options) : [];

  if (hasOptions(type) && !options.length) {
    throw new HttpError(400, 'INVALID_INPUT', 'Select fields need options');
  }

  const validation = input.validation === undefined ? field.validation : input.validation;

  return { type, options, validation: TEXT_TYPES.includes(type) ? validation : null };
};

export const updateField = async (client: Db, actor: Actor, id: string, input: FieldChanges) => {
  requireFieldManager(actor);
  // Type changes wait for values being written against this field, and the other way round.
  await lockRows(client, 'core_fields', actor.orgId, [id]);

  const field = await findField(client, actor.orgId, id);
  const typed = await typeChange(client, actor.orgId, field, input);

  if (input.groupId !== undefined && input.groupId !== field.groupId) {
    await checkGroup(client, actor.orgId, field.contentType, input.groupId);
  }

  try {
    const row = oneRow(
      await client
        .update(fields)
        .set({
          ...(input.label !== undefined ? { label: input.label } : {}),
          ...(input.order !== undefined ? { order: input.order } : {}),
          ...(input.groupId !== undefined ? { groupId: input.groupId } : {}),
          ...(input.code !== undefined ? { code: input.code || null } : {}),
          ...(input.description !== undefined ? { description: input.description || null } : {}),
          ...(input.icon !== undefined ? { icon: input.icon || null } : {}),
          ...(input.isVisible !== undefined ? { isVisible: input.isVisible } : {}),
          ...typed,
          updatedAt: sql`now()`,
        })
        .where(and(eq(fields.orgId, actor.orgId), eq(fields.id, id)))
        .returning(),
    );

    return await fieldDto(client, row);
  } catch (error) {
    return taken(error);
  }
};

export const reorderFields = (
  client: Db,
  actor: Actor,
  orders: { id: string; order: number }[],
) => {
  requireFieldManager(actor);

  return setOrders(client, actor.orgId, fields, orders);
};

export const archiveFields = async (client: Db, actor: Actor, ids: string[]) => {
  requireFieldManager(actor);
  await lockRows(client, 'core_fields', actor.orgId, ids);

  await client
    .update(fields)
    .set({ archivedAt: sql`now()`, updatedAt: sql`now()` })
    .where(and(eq(fields.orgId, actor.orgId), inArray(fields.id, ids), isNull(fields.archivedAt)));

  return { ok: true as const };
};

export const restoreField = async (client: Db, actor: Actor, id: string) => {
  requireFieldManager(actor);
  await findField(client, actor.orgId, id);

  const row = oneRow(
    await client
      .update(fields)
      .set({ archivedAt: null, updatedAt: sql`now()` })
      .where(and(eq(fields.orgId, actor.orgId), eq(fields.id, id)))
      .returning(),
  );

  return fieldDto(client, row);
};

/** Deletes fields no record holds a value of. */
export const removeUnusedFields = async (client: Db, actor: Actor, ids: string[]) => {
  requireFieldManager(actor);

  return client.transaction(async (tx) => {
    await lockRows(tx, 'core_fields', actor.orgId, ids);

    const rows = await tx
      .select()
      .from(fields)
      .where(and(eq(fields.orgId, actor.orgId), inArray(fields.id, ids)));

    if (rows.length !== unique(ids).length) {
      throw notFound('Field');
    }

    if ((await usageOf(tx, actor.orgId, rows)) > 0) {
      throw inUse(rows.length === 1 ? 'this field' : 'these fields');
    }

    await tx.delete(fields).where(and(eq(fields.orgId, actor.orgId), inArray(fields.id, ids)));

    return { ok: true as const };
  });
};

/** Deletes the field and its values on every record. */
export const removeField = async (client: Db, actor: Actor, id: string) => {
  requireFieldManager(actor);

  return client.transaction(async (tx) => {
    await lockRows(tx, 'core_fields', actor.orgId, [id]);

    await findField(tx, actor.orgId, id);
    // Its values go with it (foreign key).
    await tx.delete(fields).where(and(eq(fields.orgId, actor.orgId), eq(fields.id, id)));

    return { ok: true as const };
  });
};
