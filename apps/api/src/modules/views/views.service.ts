import { VIEW_RECORD_TYPES } from '@erxes/core-db/enums';
import type {
  ConditionGroup,
  ViewFields,
  ViewListType,
  ViewRecordType,
} from '@erxes/core-contract';
import { broadcasts, caller, type Db, newId, views } from '@erxes/core-db';
import { and, asc, count, eq, getTableColumns, inArray, or, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { callerCan } from '~/http/access';
import { fail, notAllowed, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { DATA_PATH } from '~/modules/dataExtensions/hostFilters';
import { dataSort } from './dataFilterFields';
import { filterFields } from './filterFields';
import { listSharedViews } from './pluginViews';
import { compileRecordFilter } from './recordFilter';

/** One of core's lists, whose filter core compiles; any other is a plugin's (`sales:deal`). */
const isCoreList = (recordType: ViewListType): recordType is ViewRecordType =>
  (VIEW_RECORD_TYPES as readonly string[]).includes(recordType);

/**
 * What a list's views need: to see the list, and to share a view or change a shared one. A
 * plugin's list needs neither: the plugin's own API decides what its list shows.
 */
const corePermissions = (recordType: ViewRecordType) =>
  recordType === 'product'
    ? { see: null, share: 'products.manage' }
    : { see: 'contacts.view', share: 'contacts.edit' };

const permissionsOf = (recordType: ViewListType) =>
  isCoreList(recordType) ? corePermissions(recordType) : { see: null, share: null };

/** The member may see the list the views are of. */
const assertSees = (recordType: ViewListType) => {
  const { see } = permissionsOf(recordType);

  if (see && !callerCan(see)) throw notAllowed(see);
};

/** Views with whether the member may change them: the creator; a shared one also members who may share. */
const withEditable = () => {
  const mayShare = sql.join(
    VIEW_RECORD_TYPES.map(
      (type) => sql`when ${type} then ${callerCan(corePermissions(type).share)}`,
    ),
    sql` `,
  );

  return {
    ...getTableColumns(views),
    editable: sql<boolean>`(${views.createdBy} = ${caller('user').userId}
      or (${views.shared} and case ${views.recordType} ${mayShare} else true end))`,
  };
};

/** The member's own views and the team's shared ones, shared first, then by name; a plugin's: the shared ones. */
export const listViews = async (client: Db, recordType: ViewListType) => {
  if (caller().type === 'plugin') return listSharedViews(client, recordType);

  assertSees(recordType);

  const rows = await wholeList((limit) =>
    client
      .select(withEditable())
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

  return { data: rows };
};

/** Sharing a view needs the list's share permission. */
const assertShareable = (recordType: ViewListType, shared: boolean | undefined) => {
  const { share } = permissionsOf(recordType);

  if (shared && share && !callerCan(share)) {
    throw notAllowed(share, `Sharing a view with the team needs ${share}`);
  }
};

/** Checks a core list's filter compiles (fields exist, operators fit); a plugin checks its own. */
const assertFilter = async (
  client: Db,
  recordType: ViewListType,
  filter: ConditionGroup | null,
) => {
  if (isCoreList(recordType)) await compileRecordFilter(client, recordType, filter);
};

/** A core list's sort by a Data Extensions field (`data.<key>`) names one it can sort by. */
const assertSort = async (client: Db, recordType: ViewListType, sort: ViewFields['sort']) => {
  if (isCoreList(recordType) && sort?.field.startsWith(DATA_PATH)) {
    await dataSort(client, recordType, { sortField: sort.field, sortDirection: sort.direction });
  }
};

/** Saves a view after checking its filter. */
export const createView = async (
  client: Db,
  input: ViewFields & { recordType: ViewListType; name: string },
) => {
  assertSees(input.recordType);
  assertShareable(input.recordType, input.shared);
  await assertFilter(client, input.recordType, input.filter ?? null);
  await assertSort(client, input.recordType, input.sort);

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
      .returning(withEditable()),
  );

  return row;
};

const viewOrThrow = async (client: Db, id: string) => {
  const [row] = await client.select(withEditable()).from(views).where(eq(views.id, id)).limit(1);

  // Someone else's private view doesn't exist for this member.
  if (!row || (!row.shared && row.createdBy !== caller('user').userId)) throw notFound('View');

  assertSees(row.recordType);

  return row;
};

const notEditable = (what: string) =>
  fail(
    'NOT_ALLOWED',
    `Only its creator (or, when shared, members who may share views) can ${what} this view`,
  );

export const updateView = async (client: Db, id: string, { search, ...input }: ViewFields) => {
  const row = await viewOrThrow(client, id);

  if (!row.editable) throw notEditable('change');

  assertShareable(row.recordType, input.shared);

  if (input.filter !== undefined) await assertFilter(client, row.recordType, input.filter);

  await assertSort(client, row.recordType, input.sort);

  const next = oneRow(
    await client
      .update(views)
      .set({
        ...input,
        search: search === '' ? null : search,
        updatedAt: sql`now()`,
      })
      .where(eq(views.id, id))
      .returning(withEditable()),
  );

  return next;
};

export const removeView = async (client: Db, id: string) => {
  const row = await viewOrThrow(client, id);

  if (!row.editable) throw notEditable('delete');

  // Deleting would clear their view and send them to every customer.
  const [counted] = await client
    .select({ waiting: count() })
    .from(broadcasts)
    .where(and(eq(broadcasts.viewId, id), inArray(broadcasts.status, ['draft', 'scheduled'])));

  const waiting = counted?.waiting ?? 0;

  if (waiting) {
    throw fail(
      'VIEW_IN_USE',
      `${waiting} draft or scheduled broadcasts send to this view. Give them another audience first`,
      { count: waiting },
    );
  }

  await client.delete(views).where(eq(views.id, id));

  return { ok: true as const };
};

/** What the list's filter can use, for the builder (without the SQL). */
export const listFilterFields = async (client: Db, recordType: ViewRecordType) => {
  assertSees(recordType);

  return {
    data: (await filterFields(client, recordType)).map(
      ({ path, label, type, options, group, groupLabel, currency, relation }) => ({
        path,
        label,
        type,
        options,
        group,
        groupLabel,
        currency,
        relation,
      }),
    ),
  };
};
