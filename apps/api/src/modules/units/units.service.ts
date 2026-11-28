import type { coreContract, UnitKind } from '@erxes/core-contract';
import type { InferContractRouterInputs } from '@orpc/contract';
import { actorOf, caller, type Db, newId, orgUnitMembers, orgUnits } from '@erxes/core-db';
import { and, eq, inArray, ne, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { assertRoom, assertTeam, findUnit, publishUnitEvents, setMembers } from './unitRows';
import { assertChildrenFit, assertPlacement, findType, typeForUnit } from './unitTypes.service';

export interface UnitFields {
  typeId?: string;
  name?: string;
  code?: string | null;
  parentId?: string | null;
  supervisorId?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  memberIds?: string[];
}

const badParent = (message: string) => fail('INVALID_REFERENCE', message, { field: 'parentId' });

/** The parent's path and type, after checking it is a unit of the same kind. */
const parentOf = async (client: Db, kind: UnitKind, parentId: string | null | undefined) => {
  if (!parentId) return { path: '/', typeId: null };

  const [parent] = await client
    .select({ kind: orgUnits.kind, path: orgUnits.path, typeId: orgUnits.typeId })
    .from(orgUnits)
    .where(eq(orgUnits.id, parentId));

  if (!parent) throw badParent('No such unit');

  if (parent.kind !== kind) throw badParent(`A ${kind} can only sit under a ${kind}`);

  return parent;
};

const assertPeople = async (client: Db, fields: UnitFields) => {
  await assertTeam(client, 'supervisorId', [fields.supervisorId]);
  await assertTeam(client, 'memberIds', fields.memberIds ?? []);
};

export const createUnit = async (
  client: Db,
  { memberIds = [], ...fields }: UnitFields & { kind: UnitKind; name: string },
) => {
  await assertRoom(client, 1);
  await assertPeople(client, { ...fields, memberIds });

  const id = newId();
  const parent = await parentOf(client, fields.kind, fields.parentId);
  const type = await typeForUnit(client, fields.kind, fields.typeId);

  assertPlacement(type, parent.typeId);

  await client.insert(orgUnits).values({
    ...fields,
    id,
    typeId: type.id,
    path: `${parent.path}${id}/`,
    createdBy: actorOf(caller()).actorId,
  });
  await setMembers(client, id, memberIds);
  await publishUnitEvents(client, 'created', [{ id, kind: fields.kind }]);

  return findUnit(client, id);
};

/** Every unit under `unit` gets its path rewritten from `from` to `to`; their ids. */
const movePaths = async (client: Db, from: string, to: string) => {
  const moved = await client
    .update(orgUnits)
    .set({ path: sql`${to} || substr(${orgUnits.path}, ${from.length + 1})` })
    .where(sql`starts_with(${orgUnits.path}, ${from})`)
    .returning({ id: orgUnits.id });

  return moved.map((row) => row.id);
};

export const updateUnit = async (client: Db, id: string, { memberIds, ...fields }: UnitFields) => {
  const unit = await findUnit(client, id);

  await assertPeople(client, { ...fields, memberIds });

  const changed = Object.keys(fields);
  const below: string[] = [];
  const moving = fields.parentId !== undefined && fields.parentId !== unit.parentId;
  const retyping = fields.typeId !== undefined && fields.typeId !== unit.typeId;
  const parent = await parentOf(client, unit.kind, moving ? fields.parentId : unit.parentId);

  if (moving || retyping) {
    // A new type must be active; a unit keeps an inactive one when it only moves.
    const type = retyping
      ? await typeForUnit(client, unit.kind, fields.typeId)
      : await findType(client, unit.typeId);

    assertPlacement(type, parent.typeId);

    if (retyping) await assertChildrenFit(client, id, fields.typeId ?? unit.typeId);
  }

  if (moving) {
    const to = `${parent.path}${id}/`;

    if (to.startsWith(unit.path)) throw badParent('A unit cannot sit under itself');

    below.push(...(await movePaths(client, unit.path, to)).filter((other) => other !== id));
    changed.push('path');
  }

  if (Object.keys(fields).length) {
    await client
      .update(orgUnits)
      .set({ ...fields, updatedAt: sql`now()` })
      .where(eq(orgUnits.id, id));
  }

  if (memberIds && (await setMembers(client, id, memberIds))) changed.push('memberIds');

  await publishUnitEvents(client, 'updated', [
    { id, kind: unit.kind, changed },
    ...below.map((other) => ({ id: other, kind: unit.kind, changed: ['path'] })),
  ]);

  return findUnit(client, id);
};

/** Deletes the unit and its memberships; the units under it move up to its parent. */
export const removeUnit = async (client: Db, id: string) => {
  const unit = await findUnit(client, id);

  const children = await client
    .update(orgUnits)
    .set({ parentId: unit.parentId, updatedAt: sql`now()` })
    .where(eq(orgUnits.parentId, id))
    .returning({ id: orgUnits.id });

  const below = await client
    .update(orgUnits)
    .set({ path: sql`replace(${orgUnits.path}, ${`/${id}/`}, '/')` })
    .where(and(sql`starts_with(${orgUnits.path}, ${unit.path})`, ne(orgUnits.id, id)))
    .returning({ id: orgUnits.id });

  await client.delete(orgUnits).where(eq(orgUnits.id, id));

  const childIds = new Set(children.map((row) => row.id));

  await publishUnitEvents(client, 'deleted', [{ id, kind: unit.kind }]);
  await publishUnitEvents(
    client,
    'updated',
    below.map((row) => ({
      id: row.id,
      kind: unit.kind,
      changed: childIds.has(row.id) ? ['parentId', 'path'] : ['path'],
    })),
  );

  return unit;
};

/** Puts a member in exactly these units of `kind`, out of the others of that kind. */
export const assignUnits = async (
  client: Db,
  input: InferContractRouterInputs<typeof coreContract>['units']['assign'],
) => {
  await assertTeam(client, 'userId', [input.userId]);

  const wanted = unique(input.unitIds);

  const units = wanted.length
    ? await client
        .select({ id: orgUnits.id })
        .from(orgUnits)
        .where(and(eq(orgUnits.kind, input.kind), inArray(orgUnits.id, wanted)))
    : [];

  if (units.length !== wanted.length) {
    throw fail('INVALID_REFERENCE', `No such ${input.kind}`, { field: 'unitIds' });
  }

  const held = await client
    .select({ unitId: orgUnitMembers.unitId })
    .from(orgUnitMembers)
    .innerJoin(orgUnits, eq(orgUnits.id, orgUnitMembers.unitId))
    .where(and(eq(orgUnitMembers.userId, input.userId), eq(orgUnits.kind, input.kind)));

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
    [...added, ...removed].map((id) => ({ id, kind: input.kind, changed: ['memberIds'] })),
  );

  return { unitIds: wanted };
};
