import type { SORT_DIRECTIONS } from '@erxes/core-db/enums';
import type { ConditionGroup, ViewRecordType } from '@erxes/core-contract';
import { caller, type Db, newId, views } from '@erxes/core-db';
import { and, asc, eq, or, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { callerCan, can } from '~/http/access';
import { HttpError, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { filterFields } from './filterFields';
import { compileRecordFilter } from './recordFilter';

type Row = typeof views.$inferSelect;

/** What a list's views need: to see the list, and to share a view or change a shared one. */
const permissionsOf = (recordType: ViewRecordType) =>
  recordType === 'product'
    ? { see: null, share: 'products.manage' }
    : { see: 'contacts.view', share: 'contacts.edit' };

const notAllowed = (permission: string, message = "Your role doesn't allow this") =>
  new HttpError(403, 'NOT_ALLOWED', message, { permission });

/** The member may see the list the views are of. */
const assertSees = (recordType: ViewRecordType) => {
  const { see } = permissionsOf(recordType);

  if (see && !callerCan(see)) throw notAllowed(see);
};

/** Who may change a view: its creator; a shared one also members who may share. */
const mayEdit = (row: Row) => {
  const me = caller('user');

  return (
    row.createdBy === me.userId || (row.shared && can(me, permissionsOf(row.recordType).share))
  );
};

const toDto = (row: Row) => ({ ...row, editable: mayEdit(row) });

/** The member's own views and the team's shared ones, shared first, then by name. */
export const listViews = async (client: Db, recordType: ViewRecordType) => {
  assertSees(recordType);

  const rows = await wholeList((limit) =>
    client
      .select()
      .from(views)
      .where(
        and(
          eq(views.recordType, recordType),
          or(eq(views.shared, true), eq(views.createdBy, caller('user').userId)),
        ),
      )
      .orderBy(sql`${views.shared} desc`, asc(sql`lower(${views.name})`))
      .limit(limit),
  );

  return { data: rows.map(toDto) };
};

interface ViewInput {
  name?: string;
  filter?: ConditionGroup | null;
  search?: string | null;
  columns?: string[] | null;
  sort?: { field: string; direction: (typeof SORT_DIRECTIONS)[number] } | null;
  shared?: boolean;
}

/** Sharing a view needs the list's share permission. */
const assertShareable = (recordType: ViewRecordType, shared: boolean | undefined) => {
  const { share } = permissionsOf(recordType);

  if (shared && !callerCan(share)) {
    throw notAllowed(share, `Sharing a view with the team needs ${share}`);
  }
};

/** Saves a view after checking its filter compiles (fields exist, operators fit). */
export const createView = async (
  client: Db,
  input: ViewInput & { recordType: ViewRecordType; name: string },
) => {
  assertSees(input.recordType);
  assertShareable(input.recordType, input.shared);
  await compileRecordFilter(client, input.recordType, input.filter ?? null);

  const row = oneRow(
    await client
      .insert(views)
      .values({
        id: newId(),
        recordType: input.recordType,
        name: input.name,
        filter: input.filter ?? null,
        search: input.search || null,
        columns: input.columns ?? null,
        sort: input.sort ?? null,
        shared: input.shared ?? false,
        createdBy: caller('user').userId,
      })
      .returning(),
  );

  return toDto(row);
};

const viewOrThrow = async (client: Db, id: string) => {
  const [row] = await client.select().from(views).where(eq(views.id, id)).limit(1);

  // Someone else's private view doesn't exist for this member.
  if (!row || (!row.shared && row.createdBy !== caller('user').userId)) throw notFound('View');

  assertSees(row.recordType);

  return row;
};

const notEditable = (what: string) =>
  new HttpError(
    403,
    'NOT_ALLOWED',
    `Only its creator (or, when shared, members who may share views) can ${what} this view`,
  );

export const updateView = async (client: Db, id: string, { search, ...input }: ViewInput) => {
  const row = await viewOrThrow(client, id);

  if (!mayEdit(row)) throw notEditable('change');

  assertShareable(row.recordType, input.shared);

  if (input.filter !== undefined) await compileRecordFilter(client, row.recordType, input.filter);

  const next = oneRow(
    await client
      .update(views)
      .set({
        ...input,
        search: search === '' ? null : search,
        updatedAt: sql`now()`,
      })
      .where(eq(views.id, id))
      .returning(),
  );

  return toDto(next);
};

export const removeView = async (client: Db, id: string) => {
  const row = await viewOrThrow(client, id);

  if (!mayEdit(row)) throw notEditable('delete');

  await client.delete(views).where(eq(views.id, id));

  return { ok: true as const };
};

/** What the list's filter can use, for the builder (without the SQL). */
export const listFilterFields = async (client: Db, recordType: ViewRecordType) => {
  assertSees(recordType);

  return {
    data: (await filterFields(client, recordType)).map(({ path, label, type, options, group }) => ({
      path,
      label,
      type,
      options,
      group,
    })),
  };
};
