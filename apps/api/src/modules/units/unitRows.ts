import { type CursorQuery, UNIT_MAX } from '@erxes/core-contract';
import {
  type Db,
  orgUnitMembers,
  orgUnits,
  orgUnitTypes,
  pluginInstallations,
  requestOrgId,
  users,
} from '@erxes/core-db';
import { and, eq, getTableColumns, inArray, type SQL, sql } from 'drizzle-orm';
import { alias, type PgColumn } from 'drizzle-orm/pg-core';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { keysetPage } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
import { publishCoreEvents } from '~/modules/events/events.service';

const other = alias(orgUnits, 'other_unit');
const type = alias(orgUnitTypes, 'unit_type');

const CHARACTER_AFTER_SLASH = sql.raw("'0'");

const firstPathAfterSubtree = (path: PgColumn | string) =>
  sql`(left(${path}, -1) || ${CHARACTER_AFTER_SLASH})`;

export const within = (inner: PgColumn, outer: PgColumn | string) =>
  sql`(${inner} ~>=~ ${outer} and ${inner} ~<~ ${firstPathAfterSubtree(outer)})`;

export const typeHidden = (plugin: PgColumn) => sql<boolean>`(${plugin} is not null and not exists (
  select 1 from ${pluginInstallations}
  where ${pluginInstallations.plugin} = ${plugin} and ${pluginInstallations.status} = 'active'))`;

const hiddenType = (typeId: PgColumn) =>
  sql`exists (select 1 from ${orgUnitTypes} ${type} where ${type.id} = ${typeId} and ${typeHidden(type.plugin)})`;

export const listed = (unit: typeof orgUnits | typeof other, includeInactive: boolean) =>
  and(includeInactive ? undefined : eq(unit.isActive, true), sql`not ${hiddenType(unit.typeId)}`);

export const pathSteps = (path: PgColumn) =>
  sql`unnest(string_to_array(btrim(${path}, '/'), '/')) with ordinality as step(id, depth)`;

export const reachable = (includeInactive: boolean) =>
  sql`not exists (
    select 1 from ${pathSteps(orgUnits.path)}
    join ${orgUnits} ${other} on ${other.id} = step.id
    where not (${listed(other, includeInactive)}))`;

const memberIds = sql<string[]>`coalesce((
  select array_agg(${orgUnitMembers.userId} order by ${orgUnitMembers.userId} collate "C")
  from ${orgUnitMembers} where ${orgUnitMembers.unitId} = ${orgUnits.id}
), '{}')`.as('member_ids');

const memberCount = sql<number>`(
  select count(*)::int from ${orgUnitMembers} where ${orgUnitMembers.unitId} = ${orgUnits.id}
)`.as('member_count');

const subtreeMemberCount = sql<number>`(
  select count(distinct ${orgUnitMembers.userId})::int
  from ${orgUnitMembers} join ${orgUnits} ${other} on ${other.id} = ${orgUnitMembers.unitId}
  where ${within(other.path, orgUnits.path)}
)`.as('subtree_member_count');

const childCount = (shown: SQL | undefined) =>
  sql<number>`(
    select count(*)::int from ${orgUnits} ${other}
    where ${and(eq(other.parentId, orgUnits.id), shown)}
  )`.as('child_count');

/** A unit's row with who is in it. */
const unitColumns = { ...getTableColumns(orgUnits), memberIds };

export const nodeColumns = (includeInactive: boolean) => ({
  ...getTableColumns(orgUnits),
  childCount: childCount(listed(other, includeInactive)),
  memberCount,
  subtreeMemberCount,
});

const detailColumns = {
  ...unitColumns,
  childCount: childCount(undefined),
  descendantCount: sql<number>`(
    select count(*)::int - 1 from ${orgUnits} ${other}
    where ${within(other.path, orgUnits.path)}
  )`.as('descendant_count'),
  subtreeMemberCount,
};

export type UnitRow = typeof orgUnits.$inferSelect & { memberIds: string[] };

export const findUnit = async (client: Db, id: string): Promise<UnitRow> => {
  const [row] = await client.select(unitColumns).from(orgUnits).where(eq(orgUnits.id, id));

  if (!row) throw notFound('Unit');

  return row;
};

/**
 * Every unit with its members, by pages: what a plugin's copy reads. Nothing is left out, since
 * a copy that decides who reaches what needs the inactive and the hidden units too.
 */
export const unitPage = (client: Db, query: CursorQuery & { userId?: string; typeId?: string }) =>
  keysetPage(
    client,
    { table: orgUnits, id: orgUnits.id, createdAt: orgUnits.createdAt },
    and(
      query.typeId ? eq(orgUnits.typeId, query.typeId) : undefined,
      query.userId
        ? sql`exists (select 1 from ${orgUnitMembers} where ${orgUnitMembers.unitId} = ${orgUnits.id} and ${orgUnitMembers.userId} = ${query.userId})`
        : undefined,
    ),
    query,
    (where, orderBy, limit): Promise<UnitRow[]> =>
      client
        .select(unitColumns)
        .from(orgUnits)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

export const findUnitDetail = async (client: Db, id: string) => {
  const [row] = await client.select(detailColumns).from(orgUnits).where(eq(orgUnits.id, id));

  if (!row) throw notFound('Unit');

  return row;
};

export const rootUnit = async (client: Db) => {
  const [row] = await client
    .select(detailColumns)
    .from(orgUnits)
    .where(sql`${orgUnits.parentId} is null`);

  if (!row) throw new Error('The organisation has no top unit');

  return row;
};

export const depthOf = (path: string) => path.split('/').length - 2;

export const lockTree = (client: Db) => lockKeys(client, [`units:${requestOrgId()}`]);

/** Units are added one batch at a time per organisation, so two at once can't pass the limit. */
export const assertRoom = async (client: Db, adding: number) => {
  await lockTree(client);

  if ((await client.$count(orgUnits)) + adding > UNIT_MAX) {
    throw fail(
      'UNIT_LIMIT',
      `An organisation has at most ${UNIT_MAX} units. Delete ones nothing is in first.`,
    );
  }
};

/** The given users that are on this organisation's team (row level security hides the rest). */
export const teamMembers = async (client: Db, userIds: (string | null | undefined)[]) => {
  const wanted = unique(userIds);

  if (!wanted.length) return new Set<string>();

  const rows = await client.select({ id: users.id }).from(users).where(inArray(users.id, wanted));

  return new Set(rows.map((row) => row.id));
};

/** 400 INVALID_REFERENCE unless every user is on the team. */
export const assertTeam = async (
  client: Db,
  field: 'supervisorId' | 'memberIds' | 'userId',
  userIds: (string | null | undefined)[],
) => {
  const wanted = unique(userIds);
  const found = await teamMembers(client, wanted);

  if (found.size !== wanted.length) {
    throw fail('INVALID_REFERENCE', 'Not a team member of this organisation', { field });
  }
};

/** Adds and removes members so the unit has exactly `userIds`; whether anything changed. */
export const setMembers = async (client: Db, unitId: string, userIds: string[]) => {
  const wanted = unique(userIds);

  const current = await client
    .select({ userId: orgUnitMembers.userId })
    .from(orgUnitMembers)
    .where(eq(orgUnitMembers.unitId, unitId));

  const had = new Set(current.map((row) => row.userId));
  const added = wanted.filter((id) => !had.has(id));
  const removed = [...had].filter((id) => !wanted.includes(id));

  if (removed.length) {
    await client
      .delete(orgUnitMembers)
      .where(and(eq(orgUnitMembers.unitId, unitId), inArray(orgUnitMembers.userId, removed)));
  }

  if (added.length) {
    await client.insert(orgUnitMembers).values(added.map((userId) => ({ unitId, userId })));
  }

  return added.length + removed.length > 0;
};

export type UnitAction = 'created' | 'updated' | 'deleted';

/**
 * `core.unit.<action>` for each unit, naming what changed: a subscriber reads the unit from core.
 * `subtree`: the paths of every unit under it changed too, so one event stands for them all.
 */
export const publishUnitEvents = (
  client: Db,
  action: UnitAction,
  changes: { id: string; changed?: string[]; subtree?: boolean }[],
) =>
  publishCoreEvents(
    client,
    changes.map(({ id, changed, subtree }) => ({
      type: `core.unit.${action}`,
      entityType: 'unit',
      entityId: id,
      payload: { changed: changed ?? [], ...(subtree ? { subtree: true } : {}) },
    })),
  );
