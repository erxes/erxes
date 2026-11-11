import { companies, type ContentType, customers, type CustomValue, Db, fields, newId } from '@erxes/core-db';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { type Actor, requireManager } from '~/http/auth';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { unique } from '~/lib/contacts';

type FieldRow = typeof fields.$inferSelect;
type FieldType = FieldRow['type'];

export const toFieldDto = (row: FieldRow) => ({
  id: row.id,
  contentType: row.contentType,
  label: row.label,
  type: row.type,
  options: row.options,
  order: row.order,
  createdAt: row.createdAt.toISOString(),
});

const requireFieldManager = (actor: Actor) =>
  requireManager(actor, 'Only owners and admins can manage custom fields');

const taken = (error: unknown): never => {
  if (pgCode(error) === '23505') {
    throw new HttpError(409, 'FIELD_EXISTS', 'A field with this label already exists');
  }

  throw error;
};

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

export const listFields = async (client: Db, actor: Actor, contentType: ContentType) => {
  const rows = await client
    .select()
    .from(fields)
    .where(and(eq(fields.orgId, actor.orgId), eq(fields.contentType, contentType)))
    .orderBy(asc(fields.order), asc(fields.createdAt));

  return { data: rows.map(toFieldDto) };
};

export const createField = async (
  client: Db,
  actor: Actor,
  input: { contentType: ContentType; label: string; type: FieldType; options?: string[] },
) => {
  requireFieldManager(actor);

  const hasOptions = input.type === 'select' || input.type === 'multiselect';
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
        label: input.label,
        type: input.type,
        options: hasOptions ? unique(input.options ?? []) : [],
        order: Number(last?.order ?? -1) + 1,
      })
      .returning();

    return toFieldDto(row!);
  } catch (error) {
    return taken(error);
  }
};

export const updateField = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { label?: string; options?: string[]; order?: number },
) => {
  requireFieldManager(actor);

  const field = await findField(client, actor.orgId, id);
  const hasOptions = field.type === 'select' || field.type === 'multiselect';

  if (input.options && hasOptions && !unique(input.options).length) {
    throw new HttpError(400, 'INVALID_INPUT', 'Select fields need options');
  }

  try {
    const [row] = await client
      .update(fields)
      .set({
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.options !== undefined && hasOptions ? { options: unique(input.options) } : {}),
        ...(input.order !== undefined ? { order: input.order } : {}),
        updatedAt: sql`now()`,
      })
      .where(and(eq(fields.orgId, actor.orgId), eq(fields.id, id)))
      .returning();

    return toFieldDto(row!);
  } catch (error) {
    return taken(error);
  }
};

/** Deletes the field and its values on every record. */
export const removeField = async (client: Db, actor: Actor, id: string) => {
  requireFieldManager(actor);

  return client.transaction(async (tx) => {
    const field = await findField(tx, actor.orgId, id);
    const table = field.contentType === 'customer' ? customers : companies;

    await tx
      .update(table)
      .set({ customFields: sql`${table.customFields} - ${id}::text` })
      .where(and(eq(table.orgId, actor.orgId), sql`${table.customFields} ? ${id}::text`));
    await tx.delete(fields).where(and(eq(fields.orgId, actor.orgId), eq(fields.id, id)));

    return { ok: true as const };
  });
};

const invalid = (field: FieldRow, message: string) =>
  new HttpError(400, 'INVALID_FIELD_VALUE', `${field.label}: ${message}`, { fieldId: field.id });

/** A value checked against its field: type, date format and options. */
const checkValue = (field: FieldRow, value: CustomValue): CustomValue => {
  switch (field.type) {
    case 'text':
    case 'textarea':
      if (typeof value !== 'string') throw invalid(field, 'expected text');
      return value.trim();
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
      if (typeof value !== 'string' || !field.options.includes(value)) throw invalid(field, 'not one of the options');
      return value;
    case 'multiselect': {
      if (!Array.isArray(value) || value.some((item) => !field.options.includes(item))) {
        throw invalid(field, 'not among the options');
      }
      return unique(value);
    }
  }
};

const isEmpty = (value: CustomValue | null) =>
  value === null || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * Applies a custom field patch to a record's values: each key must be a field
 * of `contentType` in the organisation; empty values (`null`, `''`, `[]`) clear it.
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
    .select()
    .from(fields)
    .where(and(eq(fields.orgId, orgId), eq(fields.contentType, contentType), inArray(fields.id, ids)));
  const byId = new Map(definitions.map((field) => [field.id, field]));
  const next = { ...current };

  for (const [id, value] of Object.entries(patch)) {
    const field = byId.get(id);

    if (!field) {
      throw new HttpError(400, 'INVALID_FIELD', `Unknown ${contentType} field`, { fieldId: id });
    }

    if (isEmpty(value)) {
      delete next[id];
    } else {
      next[id] = checkValue(field, value as CustomValue);
    }
  }

  return next;
};
