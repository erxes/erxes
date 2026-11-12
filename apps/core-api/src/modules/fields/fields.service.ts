import {
  companies,
  type ContentType,
  customers,
  type CustomValue,
  Db,
  fieldGroups,
  fields,
  newId,
} from '@erxes/core-db';
import { and, asc, eq, inArray, isNotNull, isNull, or, type SQL, sql } from 'drizzle-orm';
import { type Actor, requirePermission } from '~/http/auth';
import { HttpError, notFound, pgCode, pgConstraint } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { lockRows } from '~/lib/locks';
import { valuesTable } from './fieldValues';

type FieldRow = typeof fields.$inferSelect;
type GroupRow = typeof fieldGroups.$inferSelect;
type FieldType = FieldRow['type'];
type FieldValidation = NonNullable<FieldRow['validation']>;

const OPTION_TYPES: readonly FieldType[] = ['select', 'multiselect', 'radio', 'check'];
const TEXT_TYPES: readonly FieldType[] = ['text', 'textarea'];
/** Types sharing a stored value (mirrors the contract's FIELD_TYPE_FAMILIES). */
const TYPE_FAMILIES: readonly (readonly FieldType[])[] = [
  ['select', 'radio'],
  ['multiselect', 'check'],
  ['text', 'textarea', 'phone'],
];

const hasOptions = (type: FieldType) => OPTION_TYPES.includes(type);
const sameFamily = (from: FieldType, to: FieldType) =>
  from === to || TYPE_FAMILIES.some((family) => family.includes(from) && family.includes(to));

const iso = (date: Date | null | undefined) => (date ? date.toISOString() : null);

export const toFieldDto = (row: FieldRow, groupArchivedAt?: Date | null) => ({
  id: row.id,
  contentType: row.contentType,
  groupId: row.groupId,
  label: row.label,
  code: row.code,
  description: row.description,
  icon: row.icon,
  type: row.type,
  validation: row.validation,
  options: row.options,
  isVisible: row.isVisible,
  order: row.order,
  archivedAt: iso(row.archivedAt ?? groupArchivedAt),
  createdAt: row.createdAt.toISOString(),
});

export const toFieldGroupDto = (row: GroupRow) => ({
  id: row.id,
  contentType: row.contentType,
  name: row.name,
  code: row.code,
  description: row.description,
  order: row.order,
  archivedAt: iso(row.archivedAt),
  createdAt: row.createdAt.toISOString(),
});

const requireFieldManager = (actor: Actor) => requirePermission(actor, 'properties.manage');

const taken = (error: unknown): never => {
  if (pgCode(error) === '23505') {
    const constraint = pgConstraint(error) ?? '';

    if (constraint.startsWith('core_field_groups')) {
      throw new HttpError(409, 'FIELD_GROUP_EXISTS', 'A group with this code already exists');
    }

    throw new HttpError(
      409,
      'FIELD_EXISTS',
      constraint === 'core_fields_org_type_code_key'
        ? 'A field with this code already exists'
        : 'A field with this label already exists',
    );
  }

  throw error;
};

/** A code from a name: lower-case Latin letters and digits joined by `_`. */
const codeOf = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const recordsTable = (contentType: ContentType) => (contentType === 'customer' ? customers : companies);

const textArray = (values: string[]) => sql`array[${sql.join(
  values.map((value) => sql`${value}`),
  sql`, `,
)}]::text[]`;

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

const findGroup = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(fieldGroups)
    .where(and(eq(fieldGroups.orgId, orgId), eq(fieldGroups.id, id)))
    .limit(1);

  if (!row) {
    throw notFound('Field group');
  }

  return row;
};

/** A group a field of `contentType` may be put in: same organisation and type, not archived. */
const checkGroup = async (client: Db, orgId: string, contentType: ContentType, groupId: string | null | undefined) => {
  if (!groupId) {
    return;
  }

  const [group] = await client
    .select()
    .from(fieldGroups)
    .where(and(eq(fieldGroups.orgId, orgId), eq(fieldGroups.id, groupId)))
    .limit(1);

  if (!group || group.contentType !== contentType || group.archivedAt) {
    throw new HttpError(400, 'INVALID_FIELD_GROUP', `Not an active ${contentType} field group`, { groupId });
  }
};

/** Records of `contentType` holding a value of any of `ids`. */
const countRecords = async (client: Db, orgId: string, contentType: ContentType, ids: string[]) => {
  if (!ids.length) {
    return 0;
  }

  const values = valuesTable(contentType);
  const [row] = await client
    .select({ count: sql<number>`count(distinct ${values.recordId})::int` })
    .from(values)
    .where(and(eq(values.orgId, orgId), inArray(values.fieldId, ids)));

  return Number(row?.count ?? 0);
};

/** Records holding each option of an option field. */
const countOptions = async (client: Db, orgId: string, field: FieldRow) => {
  const values = valuesTable(field.contentType);
  const rows = await client
    .select({ value: values.textValue, count: sql<number>`count(*)::int` })
    .from(values)
    .where(and(eq(values.orgId, orgId), eq(values.fieldId, field.id), isNotNull(values.textValue)))
    .groupBy(values.textValue);

  return Object.fromEntries(rows.map((row) => [row.value!, Number(row.count)]));
};

const usageOf = async (client: Db, orgId: string, rows: FieldRow[]) => {
  let records = 0;

  for (const contentType of unique(rows.map((row) => row.contentType)) as ContentType[]) {
    records += await countRecords(
      client,
      orgId,
      contentType,
      rows.filter((row) => row.contentType === contentType).map((row) => row.id),
    );
  }

  return records;
};

const fieldsOfGroup = (client: Db, orgId: string, groupId: string) =>
  client
    .select()
    .from(fields)
    .where(and(eq(fields.orgId, orgId), eq(fields.groupId, groupId)));

/* Fields */

export const listFields = async (
  client: Db,
  actor: Actor,
  input: { contentType: ContentType; groupId?: string; archived?: boolean },
) => {
  const archived = or(isNotNull(fields.archivedAt), isNotNull(fieldGroups.archivedAt));
  const active = and(isNull(fields.archivedAt), isNull(fieldGroups.archivedAt));
  const rows = await client
    .select({ field: fields, groupArchivedAt: fieldGroups.archivedAt })
    .from(fields)
    .leftJoin(fieldGroups, eq(fieldGroups.id, fields.groupId))
    .where(
      and(
        eq(fields.orgId, actor.orgId),
        eq(fields.contentType, input.contentType),
        input.groupId ? eq(fields.groupId, input.groupId) : undefined,
        input.archived ? archived : active,
      ),
    )
    .orderBy(asc(fields.order), asc(fields.createdAt));

  return { data: rows.map((row) => toFieldDto(row.field, row.groupArchivedAt)) };
};

export const fieldUsage = async (client: Db, actor: Actor, input: { ids?: string[]; groupId?: string }) => {
  const rows = input.groupId
    ? await fieldsOfGroup(client, actor.orgId, (await findGroup(client, actor.orgId, input.groupId)).id)
    : await client
        .select()
        .from(fields)
        .where(and(eq(fields.orgId, actor.orgId), inArray(fields.id, input.ids ?? [])));
  const records = await usageOf(client, actor.orgId, rows);
  const options: Record<string, Record<string, number>> = {};

  if (records > 0) {
    for (const row of rows.filter((field) => hasOptions(field.type))) {
      options[row.id] = await countOptions(client, actor.orgId, row);
    }
  }

  return { records, options, removable: records === 0 };
};

export const createField = async (
  client: Db,
  actor: Actor,
  input: {
    contentType: ContentType;
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

  const [last] = await client
    .select({ order: sql<number>`coalesce(max(${fields.order}), -1)` })
    .from(fields)
    .where(and(eq(fields.orgId, actor.orgId), eq(fields.contentType, input.contentType)));

  try {
    const [row] = await client
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
        order: Number(last?.order ?? -1) + 1,
      })
      .returning();

    return toFieldDto(row!);
  } catch (error) {
    return taken(error);
  }
};

const groupArchivedAt = async (client: Db, groupId: string | null) =>
  groupId
    ? ((
        await client
          .select({ archivedAt: fieldGroups.archivedAt })
          .from(fieldGroups)
          .where(eq(fieldGroups.id, groupId))
          .limit(1)
      )[0]?.archivedAt ?? null)
    : null;

export const updateField = async (
  client: Db,
  actor: Actor,
  id: string,
  input: {
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
  },
) => {
  requireFieldManager(actor);
  // Type changes wait for values being written against this field, and the other way round.
  await lockRows(client, 'core_fields', actor.orgId, [id]);

  const field = await findField(client, actor.orgId, id);
  const type = input.type ?? field.type;

  if (type !== field.type && !sameFamily(field.type, type)) {
    if ((await countRecords(client, actor.orgId, field.contentType, [id])) > 0) {
      throw new HttpError(
        409,
        'FIELD_IN_USE',
        'Records hold values of this field, so it can only change to a type with the same stored value',
        { fieldId: id },
      );
    }
  }

  const nextOptions = hasOptions(type) ? unique(input.options ?? field.options) : [];

  if (hasOptions(type) && !nextOptions.length) {
    throw new HttpError(400, 'INVALID_INPUT', 'Select fields need options');
  }

  if (input.groupId !== undefined && input.groupId !== field.groupId) {
    await checkGroup(client, actor.orgId, field.contentType, input.groupId);
  }

  const textType = TEXT_TYPES.includes(type);

  try {
    const [row] = await client
      .update(fields)
      .set({
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.order !== undefined ? { order: input.order } : {}),
        ...(input.groupId !== undefined ? { groupId: input.groupId } : {}),
        ...(input.code !== undefined ? { code: input.code || null } : {}),
        ...(input.description !== undefined ? { description: input.description || null } : {}),
        ...(input.icon !== undefined ? { icon: input.icon || null } : {}),
        ...(input.isVisible !== undefined ? { isVisible: input.isVisible } : {}),
        type,
        options: nextOptions,
        validation: textType ? (input.validation !== undefined ? input.validation : field.validation) : null,
        updatedAt: sql`now()`,
      })
      .where(and(eq(fields.orgId, actor.orgId), eq(fields.id, id)))
      .returning();

    return toFieldDto(row!, await groupArchivedAt(client, row!.groupId));
  } catch (error) {
    return taken(error);
  }
};

const setOrders = async (
  client: Db,
  orgId: string,
  table: typeof fields | typeof fieldGroups,
  orders: { id: string; order: number }[],
) => {
  await client.transaction(async (tx) => {
    for (const { id, order } of orders) {
      await tx
        .update(table)
        .set({ order, updatedAt: sql`now()` })
        .where(and(eq(table.orgId, orgId), eq(table.id, id)));
    }
  });

  return { ok: true as const };
};

export const reorderFields = (client: Db, actor: Actor, orders: { id: string; order: number }[]) => {
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

  const [row] = await client
    .update(fields)
    .set({ archivedAt: null, updatedAt: sql`now()` })
    .where(and(eq(fields.orgId, actor.orgId), eq(fields.id, id)))
    .returning();

  return toFieldDto(row!, await groupArchivedAt(client, row!.groupId));
};

const inUse = (what: string) =>
  new HttpError(409, 'FIELD_IN_USE', `Records hold values of ${what}, so it can only be archived`);

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

/* Field groups */

export const listFieldGroups = async (
  client: Db,
  actor: Actor,
  input: { contentType: ContentType; archived?: boolean },
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

const groupCode = (code: string | undefined, name: string) => {
  const value = code?.trim() || codeOf(name);

  if (!value) {
    throw new HttpError(400, 'INVALID_INPUT', 'Code is required when the name has no Latin letters or digits');
  }

  return value;
};

export const createFieldGroup = async (
  client: Db,
  actor: Actor,
  input: { contentType: ContentType; name: string; code?: string; description?: string | null },
) => {
  requireFieldManager(actor);

  const code = groupCode(input.code, input.name);
  const [last] = await client
    .select({ order: sql<number>`coalesce(max(${fieldGroups.order}), -1)` })
    .from(fieldGroups)
    .where(and(eq(fieldGroups.orgId, actor.orgId), eq(fieldGroups.contentType, input.contentType)));

  try {
    const [row] = await client
      .insert(fieldGroups)
      .values({
        id: newId(),
        orgId: actor.orgId,
        contentType: input.contentType,
        name: input.name,
        code,
        description: input.description || null,
        order: Number(last?.order ?? -1) + 1,
      })
      .returning();

    return toFieldGroupDto(row!);
  } catch (error) {
    return taken(error);
  }
};

const updateGroupRow = async (client: Db, orgId: string, id: string, changes: Partial<GroupRow> | Record<string, SQL>) => {
  const [row] = await client
    .update(fieldGroups)
    .set({ ...changes, updatedAt: sql`now()` })
    .where(and(eq(fieldGroups.orgId, orgId), eq(fieldGroups.id, id)))
    .returning();

  return toFieldGroupDto(row!);
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

export const reorderFieldGroups = (client: Db, actor: Actor, orders: { id: string; order: number }[]) => {
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
    await tx.delete(fieldGroups).where(and(eq(fieldGroups.orgId, actor.orgId), eq(fieldGroups.id, id)));

    return { ok: true as const };
  });
};

/* Values */

const invalid = (field: FieldRow, message: string) =>
  new HttpError(400, 'INVALID_FIELD_VALUE', `${field.label}: ${message}`, { fieldId: field.id });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMBER = /^-?\d+([.,]\d+)?$/;
const PHONE = /^\+?[\d\s().-]{3,30}$/;

const checkText = (field: FieldRow, value: CustomValue) => {
  if (typeof value !== 'string') throw invalid(field, 'expected text');

  const text = value.trim();

  if (field.validation === 'email' && !EMAIL.test(text)) throw invalid(field, 'expected an email');
  if (field.validation === 'number' && !NUMBER.test(text)) throw invalid(field, 'expected a number');
  if (field.validation === 'date' && Number.isNaN(Date.parse(text))) throw invalid(field, 'expected a date');

  return text;
};

/** A value checked against its field: type, format and options. */
const checkValue = (field: FieldRow, value: CustomValue): CustomValue => {
  switch (field.type) {
    case 'text':
    case 'textarea':
      return checkText(field, value);
    case 'phone': {
      if (typeof value !== 'string' || !PHONE.test(value.trim()) || !/\d/.test(value)) {
        throw invalid(field, 'expected a phone number');
      }
      return value.trim();
    }
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(field, 'expected a number');
      return value;
    case 'date':
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
        throw invalid(field, 'expected a date (YYYY-MM-DD)');
      }
      return value;
    case 'boolean':
      if (typeof value !== 'boolean') throw invalid(field, 'expected yes or no');
      return value;
    case 'select':
    case 'radio':
      if (typeof value !== 'string' || !field.options.includes(value)) throw invalid(field, 'not one of the options');
      return value;
    case 'multiselect':
    case 'check': {
      if (!Array.isArray(value) || value.some((item) => !field.options.includes(item))) {
        throw invalid(field, 'not among the options');
      }
      return unique(value);
    }
    case 'list': {
      if (!Array.isArray(value)) throw invalid(field, 'expected a list of text');
      return value.map((item) => item.trim()).filter(Boolean);
    }
  }
};

const isEmpty = (value: CustomValue | null) =>
  value === null || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * Applies a custom field patch to a record's values: each key must be a field
 * of `contentType` in the organisation; empty values (`null`, `''`, `[]`) clear it.
 * Archived fields (or fields of an archived group) can only be cleared.
 */
export const applyCustomFields = async (
  client: Db,
  orgId: string,
  contentType: ContentType,
  current: Record<string, CustomValue>,
  patch: Record<string, CustomValue | null> | undefined,
) => {
  const ids = Object.keys(patch ?? {});

  if (!patch || !ids.length) {
    return current;
  }

  const definitions = await client
    .select({ field: fields, groupArchivedAt: fieldGroups.archivedAt })
    .from(fields)
    .leftJoin(fieldGroups, eq(fieldGroups.id, fields.groupId))
    .where(and(eq(fields.orgId, orgId), eq(fields.contentType, contentType), inArray(fields.id, ids)))
    // A field can't change type or go away while a value is being checked against it.
    .for('share', { of: fields });
  const byId = new Map(definitions.map((row) => [row.field.id, row]));
  const next = { ...current };

  for (const [id, value] of Object.entries(patch)) {
    const definition = byId.get(id);

    if (!definition) {
      throw new HttpError(400, 'INVALID_FIELD', `Unknown ${contentType} field`, { fieldId: id });
    }

    if (isEmpty(value)) {
      delete next[id];
      continue;
    }

    if (definition.field.archivedAt || definition.groupArchivedAt) {
      throw new HttpError(400, 'INVALID_FIELD', `${definition.field.label} is archived`, { fieldId: id });
    }

    const checked = checkValue(definition.field, value as CustomValue);

    if (isEmpty(checked)) {
      delete next[id];
    } else {
      next[id] = checked;
    }
  }

  return next;
};
