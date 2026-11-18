import {
  actorOf,
  apiKeys,
  caller,
  type Db,
  newId,
  orgUnitMembers,
  orgUnits,
  orgUnitTombstones,
} from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { unique } from '~/lib/contacts';
import {
  assertDepth,
  assertRoom,
  assertTeam,
  depthOf,
  findUnit,
  findUnitDetail,
  lockTree,
  publishUnitEvents,
  setMembers,
  type UnitRow,
  within,
} from './unitRows';
import { assertChildrenFit, assertPlacement, findType, typeForUnit } from './unitTypes.service';

export interface UnitFields {
  typeId?: string;
  name?: string;
  code?: string | null;
  supervisorId?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  memberIds?: string[];
}

const badParent = (message: string) => fail('INVALID_REFERENCE', message, { field: 'parentId' });

const rootOnly = (what: string) =>
  fail('ROOT_UNIT', `The organisation's own unit, the top of the structure, can't ${what}`);

/** The unit a new or moved one goes under: the named one, or the organisation's own. */
const parentOf = async (client: Db, parentId: string | null | undefined) => {
  const [parent] = await client
    .select({ id: orgUnits.id, path: orgUnits.path, typeId: orgUnits.typeId })
    .from(orgUnits)
    .where(parentId ? eq(orgUnits.id, parentId) : sql`${orgUnits.parentId} is null`);

  if (!parent) throw badParent('No such unit');

  return parent;
};

const assertPeople = async (client: Db, fields: UnitFields) => {
  await assertTeam(client, 'supervisorId', [fields.supervisorId]);
  await assertTeam(client, 'memberIds', fields.memberIds ?? []);
};

const lastPlace = async (client: Db, parentId: string) => {
  const [row] = await client
    .select({ last: sql<number>`coalesce(max(${orgUnits.sortOrder}), 0)` })
    .from(orgUnits)
    .where(eq(orgUnits.parentId, parentId));

  return row?.last ? row.last + 1 : 0;
};

export const createUnit = async (
  client: Db,
  { memberIds = [], parentId, ...fields }: UnitFields & { name: string; parentId?: string | null },
) => {
  await assertRoom(client, 1);
  await assertPeople(client, { ...fields, memberIds });

  const id = newId();
  const parent = await parentOf(client, parentId);
  const type = await typeForUnit(client, fields.typeId, parent.typeId);

  assertDepth(depthOf(parent.path) + 1);
  assertPlacement(type, parent.typeId);

  await client.insert(orgUnits).values({
    ...fields,
    id,
    typeId: type.id,
    parentId: parent.id,
    path: `${parent.path}${id}/`,
    sortOrder: fields.sortOrder ?? (await lastPlace(client, parent.id)),
    createdBy: actorOf(caller()).actorId,
  });
  await setMembers(client, id, memberIds);
  await publishUnitEvents(client, 'created', [{ id }]);

  return findUnit(client, id);
};

const assertRetype = async (client: Db, unit: UnitRow, typeId: string) => {
  const type = await typeForUnit(client, typeId, null);
  const parent = await parentOf(client, unit.parentId);

  assertPlacement(type, parent.typeId);
  await assertChildrenFit(client, unit.id, typeId);
};

export const updateUnit = async (client: Db, id: string, { memberIds, ...fields }: UnitFields) => {
  const unit = await findUnit(client, id);

  if (unit.parentId === null && fields.typeId !== undefined) throw rootOnly('have a type');

  if (unit.parentId === null && fields.isActive === false) throw rootOnly('be turned off');

  await assertPeople(client, { ...fields, memberIds });

  if (fields.typeId !== undefined && fields.typeId !== unit.typeId) {
    await assertRetype(client, unit, fields.typeId);
  }

  const changed = Object.keys(fields);

  if (changed.length) {
    await client
      .update(orgUnits)
      .set({ ...fields, updatedAt: sql`now()` })
      .where(eq(orgUnits.id, id));
  }

  if (memberIds && (await setMembers(client, id, memberIds))) changed.push('memberIds');

  await publishUnitEvents(client, 'updated', [{ id, changed }]);

  return findUnit(client, id);
};

const deepestUnder = async (client: Db, path: string) => {
  const [row] = await client
    .select({
      depth: sql<number>`max(length(${orgUnits.path}) - length(replace(${orgUnits.path}, '/', '')) - 1)`,
    })
    .from(orgUnits)
    .where(within(orgUnits.path, path));

  return row?.depth ?? depthOf(path);
};

export const moveUnit = async (client: Db, id: string, parentId: string | null) => {
  await lockTree(client);

  const before = await findUnitDetail(client, id);

  if (before.parentId === null || !before.typeId) throw rootOnly('be moved');

  const parent = await parentOf(client, parentId);

  if (parent.id === before.parentId) return { unit: await findUnit(client, id), moved: null };

  if (parent.path.startsWith(before.path)) {
    throw badParent('A unit cannot sit under itself or a unit under it');
  }

  assertDepth(
    depthOf(parent.path) + 1 + (await deepestUnder(client, before.path)) - depthOf(before.path),
  );
  assertPlacement(await findType(client, before.typeId), parent.typeId);

  const to = `${parent.path}${id}/`;
  const sortOrder = await lastPlace(client, parent.id);

  await client
    .update(orgUnits)
    .set({ path: sql`${to} || substr(${orgUnits.path}, ${before.path.length + 1})` })
    .where(within(orgUnits.path, before.path));
  await client
    .update(orgUnits)
    .set({ parentId: parent.id, sortOrder, updatedAt: sql`now()` })
    .where(eq(orgUnits.id, id));
  await publishUnitEvents(client, 'updated', [
    { id, changed: ['parentId', 'path', 'sortOrder'], subtree: true },
  ]);

  return {
    unit: await findUnit(client, id),
    moved: {
      from: before.parentId,
      to: parent.id,
      units: before.descendantCount + 1,
      members: before.subtreeMemberCount,
    },
  };
};

export const reorderUnits = async (client: Db, parentId: string, unitIds: string[]) => {
  await lockTree(client);
  await findUnit(client, parentId);

  const ids = unique(unitIds);

  const found = await client.$count(
    orgUnits,
    and(eq(orgUnits.parentId, parentId), inArray(orgUnits.id, ids)),
  );

  if (found !== ids.length) {
    throw fail('INVALID_REFERENCE', 'Not a unit right under this one', { field: 'unitIds' });
  }

  await client
    .update(orgUnits)
    .set({ sortOrder: sql`${orgUnits.sortOrder} + ${ids.length}` })
    .where(and(eq(orgUnits.parentId, parentId), notInArray(orgUnits.id, ids)));
  await client.execute(sql`update ${orgUnits} set sort_order = named.place - 1, updated_at = now()
    from unnest(${textArray(ids)}) with ordinality as named(id, place)
    where ${orgUnits.id} = named.id`);
  await publishUnitEvents(client, 'updated', [{ id: parentId, changed: ['childOrder'] }]);
};

/**
 * Deletes a unit nothing is in. One that units sit under, members are in or API keys name stays:
 * it is turned off instead, so what names it still finds it. Its id is kept, never to be reused.
 */
export const removeUnit = async (client: Db, id: string) => {
  await lockTree(client);

  const unit = await findUnitDetail(client, id);

  if (unit.parentId === null) throw rootOnly('be deleted');

  const keys = await client.$count(apiKeys, sql`${id} = any(${apiKeys.unitIds})`);
  const inside = { children: unit.childCount, members: unit.memberIds.length, keys };

  if (inside.children || inside.members || inside.keys) {
    throw fail(
      'UNIT_NOT_EMPTY',
      `${unit.name} has units under it, members in it or API keys that name it. Turn it off instead.`,
      inside,
    );
  }

  await client.delete(orgUnits).where(eq(orgUnits.id, id));
  await client.insert(orgUnitTombstones).values({ id });
  await publishUnitEvents(client, 'deleted', [{ id }]);

  return unit;
};

/** Puts a member in exactly these units, out of every other. */
export const assignUnits = async (client: Db, input: { userId: string; unitIds: string[] }) => {
  await assertTeam(client, 'userId', [input.userId]);

  const wanted = unique(input.unitIds);

  const found = wanted.length ? await client.$count(orgUnits, inArray(orgUnits.id, wanted)) : 0;

  if (found !== wanted.length) {
    throw fail('INVALID_REFERENCE', 'No such unit', { field: 'unitIds' });
  }

  const held = await client
    .select({ unitId: orgUnitMembers.unitId })
    .from(orgUnitMembers)
    .where(eq(orgUnitMembers.userId, input.userId));

  const had = new Set(held.map((row) => row.unitId));
  const added = wanted.filter((id) => !had.has(id));
  const removed = [...had].filter((id) => !wanted.includes(id));

  if (removed.length) {
    await client
      .delete(orgUnitMembers)
      .where(and(eq(orgUnitMembers.userId, input.userId), inArray(orgUnitMembers.unitId, removed)));
  }

  if (added.length) {
    await client
      .insert(orgUnitMembers)
      .values(added.map((unitId) => ({ unitId, userId: input.userId })));
  }

  await publishUnitEvents(
    client,
    'updated',
    [...added, ...removed].map((id) => ({ id, changed: ['memberIds'] })),
  );

  return { unitIds: wanted };
};
