import { type CursorQuery, UNIT_DEPTH_MAX, UNIT_MAX } from '@erxes/core-contract';
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
import { unitInReach, unitShown, userInReach } from '~/modules/reach/reach';
import { within } from './unitPaths';

const other = alias(orgUnits, 'other_unit');
const type = alias(orgUnitTypes, 'unit_type');

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

/**
 * The columns below are built for the caller. A member whose role reaches less than the
 * organisation is shown the units they reach and, by name, the units above those: a unit's
 * people and counts are those of the units they reach, so a unit above theirs has none.
 */
const memberIds = () =>
  sql<string[]>`coalesce((
  select array_agg(${orgUnitMembers.userId} order by ${orgUnitMembers.userId} collate "C")
  from ${orgUnitMembers}
  where ${and(eq(orgUnitMembers.unitId, orgUnits.id), unitInReach(orgUnits))}
), '{}')`.as('member_ids');

const memberCount = () =>
  sql<number>`(
  select count(*)::int from ${orgUnitMembers}
  where ${and(eq(orgUnitMembers.unitId, orgUnits.id), unitInReach(orgUnits))}
)`.as('member_count');

const subtreeMemberCount = () =>
  sql<number>`(
  select count(distinct ${orgUnitMembers.userId})::int
  from ${orgUnitMembers} join ${orgUnits} ${other} on ${other.id} = ${orgUnitMembers.unitId}
  where ${and(within(other.path, orgUnits.path), unitInReach(other))}
)`.as('subtree_member_count');

const childCount = (shown: SQL | undefined) =>
  sql<number>`(
    select count(*)::int from ${orgUnits} ${other}
    where ${and(eq(other.parentId, orgUnits.id), shown, unitShown(other))}
  )`.as('child_count');

/** A unit's row with who is in it. */
const unitColumns = () => ({ ...getTableColumns(orgUnits), memberIds: memberIds() });

export const nodeColumns = (includeInactive: boolean) => ({
  ...getTableColumns(orgUnits),
  childCount: childCount(listed(other, includeInactive)),
  memberCount: memberCount(),
  subtreeMemberCount: subtreeMemberCount(),
});

const detailColumns = () => ({
  ...unitColumns(),
  childCount: childCount(undefined),
  descendantCount: sql<number>`(
    select count(*)::int - 1 from ${orgUnits} ${other}
    where ${and(within(other.path, orgUnits.path), unitShown(other))}
  )`.as('descendant_count'),
  subtreeMemberCount: subtreeMemberCount(),
});

export type UnitRow = typeof orgUnits.$inferSelect & { memberIds: string[] };

/** The unit, when the caller is shown it: 404 otherwise. */
export const findUnit = async (client: Db, id: string): Promise<UnitRow> => {
  const [row] = await client
    .select(unitColumns())
    .from(orgUnits)
    .where(and(eq(orgUnits.id, id), unitShown(orgUnits)));

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
      unitShown(orgUnits),
      query.typeId ? eq(orgUnits.typeId, query.typeId) : undefined,
      query.userId
        ? sql`exists (select 1 from ${orgUnitMembers} where ${and(eq(orgUnitMembers.unitId, orgUnits.id), eq(orgUnitMembers.userId, query.userId), unitInReach(orgUnits))})`
        : undefined,
    ),
    query,
    (where, orderBy, limit): Promise<UnitRow[]> =>
      client
        .select(unitColumns())
        .from(orgUnits)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

export const findUnitDetail = async (client: Db, id: string) => {
  const [row] = await client
    .select(detailColumns())
    .from(orgUnits)
    .where(and(eq(orgUnits.id, id), unitShown(orgUnits)));

  if (!row) throw notFound('Unit');

  return row;
};

/** The organisation's own unit: everyone is shown it, since every unit sits under it. */
export const rootUnit = async (client: Db) => {
  const [row] = await client
    .select(detailColumns())
    .from(orgUnits)
    .where(sql`${orgUnits.parentId} is null`);

  if (!row) throw new Error('The organisation has no top unit');

  return row;
};

export const depthOf = (path: string) => path.split('/').length - 2;

/** 400 when a unit would sit deeper than the structure allows. */
export const assertDepth = (depth: number) => {
  if (depth > UNIT_DEPTH_MAX) {
    throw fail('INVALID_REFERENCE', `The structure goes at most ${UNIT_DEPTH_MAX} units deep`, {
      field: 'parentId',
    });
  }
};

/** A code or name as matching compares it: trimmed, any case. */
export const lower = (value: string | null | undefined) => value?.trim().toLowerCase() ?? '';

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

/**
 * The given users that are on this organisation's team (row level security hides the rest) and
 * within the caller's reach.
 */
export const teamMembers = async (client: Db, userIds: (string | null | undefined)[]) => {
  const wanted = unique(userIds);

  if (!wanted.length) return new Set<string>();

  const rows = await client
    .select({ id: users.id })
    .from(users)
    .where(and(inArray(users.id, wanted), userInReach(users.id)));

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
