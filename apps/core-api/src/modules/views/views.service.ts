import type { ConditionGroup, View, ViewRecordType } from '@erxes/core-contract';
import { type Db, newId, views } from '@erxes/core-db';
import { and, asc, eq, or, sql } from 'drizzle-orm';
import { type Actor } from '~/http/auth';
import { can } from '~/http/access';
import { HttpError, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { filterFields } from './filterFields';
import { compileRecordFilter } from './recordFilter';

type Row = typeof views.$inferSelect;

/** Who may change a view: its creator; a shared one also members who edit contacts. */
const mayEdit = (actor: Actor, row: Row) =>
  row.createdBy === actor.userId || (row.shared && can(actor, 'contacts.edit'));

const toDto = (actor: Actor, row: Row): View => ({
  id: row.id,
  recordType: row.recordType,
  name: row.name,
  filter: row.filter,
  search: row.search,
  columns: row.columns,
  sort: row.sort,
  shared: row.shared,
  createdBy: row.createdBy,
  editable: mayEdit(actor, row),
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

/** The member's own views and the team's shared ones, shared first, then by name. */
export const listViews = async (client: Db, actor: Actor, recordType: ViewRecordType) => ({
  data: (
    await client
      .select()
      .from(views)
      .where(
        and(
          eq(views.orgId, actor.orgId),
          eq(views.recordType, recordType),
          or(eq(views.shared, true), eq(views.createdBy, actor.userId)),
        ),
      )
      .orderBy(sql`${views.shared} desc`, asc(sql`lower(${views.name})`))
  ).map((row) => toDto(actor, row)),
});

interface ViewInput {
  name?: string;
  filter?: ConditionGroup | null;
  search?: string | null;
  columns?: string[] | null;
  sort?: { field: string; direction: 'asc' | 'desc' } | null;
  shared?: boolean;
}

const assertShareable = (actor: Actor, shared: boolean | undefined) => {
  if (shared && !can(actor, 'contacts.edit')) {
    throw new HttpError(403, 'NOT_ALLOWED', 'Sharing a view with the team needs contacts.edit', {
      permission: 'contacts.edit',
    });
  }
};

/** Saves a view after checking its filter compiles (fields exist, operators fit). */
export const createView = async (
  client: Db,
  actor: Actor,
  input: ViewInput & { recordType: ViewRecordType; name: string },
) => {
  assertShareable(actor, input.shared);
  await compileRecordFilter(client, actor, input.recordType, input.filter ?? null);

  const row = oneRow(
    await client
      .insert(views)
      .values({
        id: newId(),
        orgId: actor.orgId,
        recordType: input.recordType,
        name: input.name,
        filter: input.filter ?? null,
        search: input.search || null,
        columns: input.columns ?? null,
        sort: input.sort ?? null,
        shared: input.shared ?? false,
        createdBy: actor.userId,
      })
      .returning(),
  );

  return toDto(actor, row);
};

const viewOrThrow = async (client: Db, actor: Actor, id: string) => {
  const [row] = await client
    .select()
    .from(views)
    .where(and(eq(views.orgId, actor.orgId), eq(views.id, id)))
    .limit(1);

  // Someone else's private view doesn't exist for this member.
  if (!row || (!row.shared && row.createdBy !== actor.userId)) throw notFound('View');

  return row;
};

export const updateView = async (client: Db, actor: Actor, id: string, input: ViewInput) => {
  const row = await viewOrThrow(client, actor, id);

  if (!mayEdit(actor, row))
    throw new HttpError(
      403,
      'NOT_ALLOWED',
      'Only its creator (or, when shared, members who edit contacts) can change this view',
    );

  assertShareable(actor, input.shared);

  if (input.filter !== undefined)
    await compileRecordFilter(client, actor, row.recordType, input.filter);

  const next = oneRow(
    await client
      .update(views)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.filter !== undefined ? { filter: input.filter } : {}),
        ...(input.search !== undefined ? { search: input.search || null } : {}),
        ...(input.columns !== undefined ? { columns: input.columns } : {}),
        ...(input.sort !== undefined ? { sort: input.sort } : {}),
        ...(input.shared !== undefined ? { shared: input.shared } : {}),
        updatedAt: sql`now()`,
      })
      .where(eq(views.id, id))
      .returning(),
  );

  return toDto(actor, next);
};

export const removeView = async (client: Db, actor: Actor, id: string) => {
  const row = await viewOrThrow(client, actor, id);

  if (!mayEdit(actor, row))
    throw new HttpError(
      403,
      'NOT_ALLOWED',
      'Only its creator (or, when shared, members who edit contacts) can delete this view',
    );

  await client.delete(views).where(eq(views.id, id));

  return { ok: true as const };
};

/** What the list's filter can use, for the builder (without the SQL). */
export const listFilterFields = async (client: Db, actor: Actor, recordType: ViewRecordType) => ({
  data: (await filterFields(client, actor.orgId, recordType)).map(
    ({ path, label, type, options, group }) => ({ path, label, type, options, group }),
  ),
});
