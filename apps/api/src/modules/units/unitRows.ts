import { LIST_MAX, type UnitKind } from '@erxes/core-contract';
import { type Db, orgUnitMembers, orgUnits, requestOrgId, users } from '@erxes/core-db';
import { and, asc, eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { wholeList } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
import { publishCoreEvents } from '~/modules/events/events.service';

/** A unit's row with who is in it. */
const unitColumns = {
  ...getTableColumns(orgUnits),
  memberIds: sql<string[]>`coalesce((
    select array_agg(${orgUnitMembers.userId} order by ${orgUnitMembers.userId} collate "C")
    from ${orgUnitMembers} where ${orgUnitMembers.unitId} = ${orgUnits.id}
  ), '{}')`.as('member_ids'),
};

export type UnitRow = typeof orgUnits.$inferSelect & { memberIds: string[] };

/** Branches or departments with their members, parents before the units under them. */
export const unitRows = (
  client: Db,
  query: { kind?: UnitKind; userId?: string; ids?: string[] } = {},
): Promise<UnitRow[]> =>
  wholeList((limit) =>
    client
      .select(unitColumns)
      .from(orgUnits)
      .where(
        and(
          query.kind ? eq(orgUnits.kind, query.kind) : undefined,
          query.ids ? inArray(orgUnits.id, query.ids) : undefined,
          query.userId
            ? sql`exists (select 1 from ${orgUnitMembers} where ${orgUnitMembers.unitId} = ${orgUnits.id} and ${orgUnitMembers.userId} = ${query.userId})`
            : undefined,
        ),
      )
      .orderBy(asc(orgUnits.kind), asc(orgUnits.path))
      .limit(limit),
  );

export const findUnit = async (client: Db, id: string) => {
  const [row] = await unitRows(client, { ids: [id] });

  if (!row) throw notFound('Unit');

  return row;
};

/** Units are added one batch at a time per organisation, so two at once can't pass the limit. */
export const assertRoom = async (client: Db, adding: number) => {
  await lockKeys(client, [`units:${requestOrgId()}`]);

  if ((await client.$count(orgUnits)) + adding > LIST_MAX) {
    throw fail(
      'UNIT_LIMIT',
      `An organisation has at most ${LIST_MAX} branches and departments. Remove ones you don't use first.`,
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

/** `core.unit.<action>` for each unit, naming what changed: a subscriber reads the unit from core. */
export const publishUnitEvents = (
  client: Db,
  action: UnitAction,
  changes: { id: string; kind: UnitKind; changed?: string[] }[],
) =>
  publishCoreEvents(
    client,
    changes.map(({ id, kind, changed }) => ({
      type: `core.unit.${action}`,
      entityType: 'unit',
      entityId: id,
      payload: { kind, changed: changed ?? [] },
    })),
  );
