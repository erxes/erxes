import { FIELD_TYPE_FAMILIES } from '@erxes/core-contract';
import { caller, type FieldContentType, type Db, fieldGroups, fields, newId } from '@erxes/core-db';
import { and, asc, eq, inArray, isNotNull, isNull, or, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
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
  taken,
  fieldById,
  selectFields,
  usageOf,
} from './fieldRows';

type FieldValidation = NonNullable<FieldRow['validation']>;

const TEXT_TYPES: readonly FieldType[] = ['text', 'textarea'];

const sameFamily = (from: FieldType, to: FieldType) =>
  from === to || FIELD_TYPE_FAMILIES.some((family) => family.includes(from) && family.includes(to));

const findField = async (client: Db, id: string) => {
  const [row] = await client.select().from(fields).where(eq(fields.id, id)).limit(1);

  if (!row) {
    throw notFound('Field');
  }

  return row;
};

/** A group a field of `contentType` may be put in: same organisation and type, not archived. */
const checkGroup = async (
  client: Db,
  contentType: FieldContentType,
  groupId: string | null | undefined,
) => {
  if (!groupId) {
    return;
  }

  const [group] = await client
    .select()
    .from(fieldGroups)
    .where(eq(fieldGroups.id, groupId))
    .limit(1);

  if (!group || group.contentType !== contentType || group.archivedAt) {
    throw new HttpError(400, 'INVALID_FIELD_GROUP', `Not an active ${contentType} field group`, {
      groupId,
    });
  }
};

export const listFields = async (
  client: Db,
  input: { contentType: FieldContentType; groupId?: string; archived?: boolean },
) => {
  // Plugins read product fields (with products:read) to show product values; contacts' fields stay members'.
  if (caller().type === 'plugin' && input.contentType !== 'product') {
    throw forbidden('FORBIDDEN', 'Plugins read product fields only');
  }

  const archived = or(isNotNull(fields.archivedAt), isNotNull(fieldGroups.archivedAt));
  const active = and(isNull(fields.archivedAt), isNull(fieldGroups.archivedAt));

  const rows = await wholeList((limit) =>
    selectFields(client)
      .where(
        and(
          eq(fields.contentType, input.contentType),
          input.groupId ? eq(fields.groupId, input.groupId) : undefined,
          input.archived ? archived : active,
        ),
      )
      .orderBy(asc(fields.order), asc(fields.createdAt))
      .limit(limit),
  );

  return { data: rows };
};

export const fieldUsage = async (client: Db, input: { ids?: string[]; groupId?: string }) => {
  const rows = input.groupId
    ? await fieldsOfGroup(client, (await findGroup(client, input.groupId)).id)
    : await client
        .select()
        .from(fields)
        .where(inArray(fields.id, input.ids ?? []));

  const records = await usageOf(client, rows);

  const options =
    records > 0
      ? await optionCounts(
          client,
          rows.filter((field) => hasOptions(field.type)),
        )
      : {};

  return { records, options, removable: records === 0 };
};

export const createField = async (
  client: Db,
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
  await checkGroup(client, input.contentType, input.groupId);

  const order = await nextOrder(client, fields, input.contentType);

  try {
    const row = oneRow(
      await client
        .insert(fields)
        .values({
          id: newId(),
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

    return await fieldById(client, row.id);
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
const typeChange = async (client: Db, field: FieldRow, input: FieldChanges) => {
  const type = input.type ?? field.type;

  if (!sameFamily(field.type, type) && (await usageOf(client, [field])) > 0) {
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

export const updateField = async (client: Db, id: string, input: FieldChanges) => {
  // Type changes wait for values being written against this field, and the other way round.
  await lockRows(client, 'core_fields', [id]);

  const field = await findField(client, id);
  const typed = await typeChange(client, field, input);
  const { code, description, icon, ...rest } = input;

  if (input.groupId !== undefined && input.groupId !== field.groupId) {
    await checkGroup(client, field.contentType, input.groupId);
  }

  try {
    const row = oneRow(
      await client
        .update(fields)
        .set({
          ...rest,
          code: code === '' ? null : code,
          description: description === '' ? null : description,
          icon: icon === '' ? null : icon,
          ...typed,
          updatedAt: sql`now()`,
        })
        .where(eq(fields.id, id))
        .returning(),
    );

    return await fieldById(client, row.id);
  } catch (error) {
    return taken(error);
  }
};

export const reorderFields = (client: Db, orders: { id: string; order: number }[]) =>
  setOrders(client, fields, orders);

export const archiveFields = async (client: Db, ids: string[]) => {
  await lockRows(client, 'core_fields', ids);

  await client
    .update(fields)
    .set({ archivedAt: sql`now()`, updatedAt: sql`now()` })
    .where(and(inArray(fields.id, ids), isNull(fields.archivedAt)));

  return { ok: true as const };
};

export const restoreField = async (client: Db, id: string) => {
  await findField(client, id);

  const row = oneRow(
    await client
      .update(fields)
      .set({ archivedAt: null, updatedAt: sql`now()` })
      .where(eq(fields.id, id))
      .returning(),
  );

  return fieldById(client, row.id);
};

/** Deletes fields no record holds a value of. */
export const removeUnusedFields = async (client: Db, ids: string[]) => {
  await lockRows(client, 'core_fields', ids);

  const rows = await client.select().from(fields).where(inArray(fields.id, ids));

  if (rows.length !== unique(ids).length) {
    throw notFound('Field');
  }

  if ((await usageOf(client, rows)) > 0) {
    throw inUse(rows.length === 1 ? 'this field' : 'these fields');
  }

  await client.delete(fields).where(inArray(fields.id, ids));

  return { ok: true as const };
};

/** Deletes the field and its values on every record. */
export const removeField = async (client: Db, id: string) => {
  await lockRows(client, 'core_fields', [id]);

  await findField(client, id);
  // Its values go with it (foreign key).
  await client.delete(fields).where(eq(fields.id, id));

  return { ok: true as const };
};
