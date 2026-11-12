import { type ContentType, type Db, fieldGroups, fields } from '@erxes/core-db';
import { and, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { type Actor, requirePermission } from '~/http/auth';
import { HttpError, notFound, pgCode, pgConstraint } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { valuesTable } from './fieldValues';

export type FieldRow = typeof fields.$inferSelect;

export type GroupRow = typeof fieldGroups.$inferSelect;

export type FieldType = FieldRow['type'];

const OPTION_TYPES: readonly FieldType[] = ['select', 'multiselect', 'radio', 'check'];

export const hasOptions = (type: FieldType) => OPTION_TYPES.includes(type);

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

export const requireFieldManager = (actor: Actor) => requirePermission(actor, 'properties.manage');

/** A unique violation as the field or group conflict it means; anything else is rethrown. */
export const taken = (error: unknown): never => {
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

export const inUse = (what: string) =>
  new HttpError(409, 'FIELD_IN_USE', `Records hold values of ${what}, so it can only be archived`);

export const findGroup = async (client: Db, orgId: string, id: string) => {
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

export const fieldsOfGroup = (client: Db, orgId: string, groupId: string) =>
  client
    .select()
    .from(fields)
    .where(and(eq(fields.orgId, orgId), eq(fields.groupId, groupId)));

/** Records of `contentType` holding a value of any of `ids`. */
export const countRecords = async (
  client: Db,
  orgId: string,
  contentType: ContentType,
  ids: string[],
) => {
  if (!ids.length) {
    return 0;
  }

  const values = valuesTable(contentType);

  const [row] = await client
    .select({ count: sql<number>`count(distinct ${values.recordId})::int` })
    .from(values)
    .where(and(eq(values.orgId, orgId), inArray(values.fieldId, ids)));

  return row?.count ?? 0;
};

/** Records holding each option of an option field. */
export const countOptions = async (client: Db, orgId: string, field: FieldRow) => {
  const values = valuesTable(field.contentType);

  const rows = await client
    .select({ value: values.textValue, count: sql<number>`count(*)::int` })
    .from(values)
    .where(and(eq(values.orgId, orgId), eq(values.fieldId, field.id), isNotNull(values.textValue)))
    .groupBy(values.textValue);

  return Object.fromEntries(rows.map((row) => [row.value, row.count]));
};

/** Records holding a value of any of `rows`. */
export const usageOf = async (client: Db, orgId: string, rows: FieldRow[]) => {
  let records = 0;

  for (const contentType of unique(rows.map((row) => row.contentType))) {
    records += await countRecords(
      client,
      orgId,
      contentType,
      rows.filter((row) => row.contentType === contentType).map((row) => row.id),
    );
  }

  return records;
};

/** The next `order` after the last field or group of a content type. */
export const nextOrder = async (
  client: Db,
  table: typeof fields | typeof fieldGroups,
  orgId: string,
  contentType: ContentType,
) => {
  const [last] = await client
    .select({ order: sql<number>`coalesce(max(${table.order}), -1)` })
    .from(table)
    .where(and(eq(table.orgId, orgId), eq(table.contentType, contentType)));

  return (last?.order ?? -1) + 1;
};

export const setOrders = async (
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
