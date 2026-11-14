import { type FieldContentType, type Db, fieldGroups, fields } from '@erxes/core-db';
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

/** A field archives with its group. */
export const toFieldDto = (row: FieldRow, groupArchivedAt?: Date | null) => ({
  ...row,
  archivedAt: row.archivedAt ?? groupArchivedAt ?? null,
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

export const findGroup = async (client: Db, id: string) => {
  const [row] = await client.select().from(fieldGroups).where(eq(fieldGroups.id, id)).limit(1);

  if (!row) {
    throw notFound('Field group');
  }

  return row;
};

export const fieldsOfGroup = (client: Db, groupId: string) =>
  client.select().from(fields).where(eq(fields.groupId, groupId));

/** Each content type's values table, with the ids of `rows` of that type. */
const byValuesTable = (rows: Pick<FieldRow, 'id' | 'contentType'>[]) =>
  unique(rows.map((row) => row.contentType)).map((contentType) => ({
    values: valuesTable(contentType),
    ids: rows.filter((row) => row.contentType === contentType).map((row) => row.id),
  }));

/** Records holding a value of any of `rows` (one query across content types). */
export const usageOf = async (client: Db, rows: Pick<FieldRow, 'id' | 'contentType'>[]) => {
  const counts = byValuesTable(rows).map(
    ({ values, ids }) =>
      sql`(select count(distinct ${values.recordId}) from ${values} where ${inArray(values.fieldId, ids)})`,
  );

  if (!counts.length) return 0;

  const {
    rows: [row],
  } = await client.execute<{ records: number }>(
    sql`select (${sql.join(counts, sql` + `)})::int as records`,
  );

  return row?.records ?? 0;
};

/** Records holding each option of each of `rows` (option fields), by field id, in one query. */
export const optionCounts = async (client: Db, rows: FieldRow[]) => {
  const selects = byValuesTable(rows).map(
    ({ values, ids }) =>
      sql`select ${values.fieldId} as field_id, ${values.textValue} as value, count(*)::int as count
        from ${values}
        where ${and(inArray(values.fieldId, ids), isNotNull(values.textValue))}
        group by 1, 2`,
  );

  const counted = selects.length
    ? (
        await client.execute<{ field_id: string; value: string; count: number }>(
          sql.join(selects, sql` union all `),
        )
      ).rows
    : [];

  // `fromEntries`, not assignment: an option may be called `__proto__`.
  return Object.fromEntries(
    rows.map(
      (row) =>
        [
          row.id,
          Object.fromEntries(
            counted
              .filter((count) => count.field_id === row.id)
              .map((count) => [count.value, count.count] as const),
          ),
        ] as const,
    ),
  );
};

/** The next `order` after the last field or group of a content type. */
export const nextOrder = async (
  client: Db,
  table: typeof fields | typeof fieldGroups,
  contentType: FieldContentType,
) => {
  const [last] = await client
    .select({ order: sql<number>`coalesce(max(${table.order}), -1)` })
    .from(table)
    .where(eq(table.contentType, contentType));

  return (last?.order ?? -1) + 1;
};
