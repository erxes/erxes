import {
  actorOf,
  caller,
  type Db,
  orgUnitMembers,
  orgUnits,
  orgUnitTombstones,
} from '@erxes/core-db';
import { inArray } from 'drizzle-orm';
import { fail } from '~/http/errors';
import {
  assertDepth,
  assertRoom,
  depthOf,
  lower,
  publishUnitEvents,
  teamMembers,
} from './unitRows';
import type { UnitFields } from './units.service';
import { unitTypeRows } from './unitTypes.service';

export type ImportedUnit = Omit<UnitFields, 'memberIds'> & {
  id: string;
  name: string;
  parentId?: string | null;
  memberIds: string[];
};

interface Known {
  id: string;
  name: string;
  code: string | null;
  parentId: string | null;
  path: string;
}

/** Parents before the units under them; a parent outside the batch counts as placed. */
const parentsFirst = (units: ImportedUnit[]) => {
  const byId = new Map(units.map((unit) => [unit.id, unit]));
  const placed = new Set<string>();
  const ordered: ImportedUnit[] = [];

  const place = (unit: ImportedUnit, climbing: Set<string>) => {
    if (placed.has(unit.id) || climbing.has(unit.id)) return;

    climbing.add(unit.id);

    const parent = unit.parentId ? byId.get(unit.parentId) : undefined;

    if (parent) place(parent, climbing);

    placed.add(unit.id);
    ordered.push(unit);
  };

  for (const unit of units) place(unit, new Set());

  return ordered;
};

const named = (name: string, parentId: string | null) => `${parentId ?? ''} ${lower(name)}`;

const indexOf = (known: Known[]) => {
  const byId = new Map<string, Known>();
  const byCode = new Map<string, Known>();
  const byName = new Map<string, Known>();

  const add = (unit: Known) => {
    byId.set(unit.id, unit);
    byName.set(named(unit.name, unit.parentId), unit);

    if (unit.code) byCode.set(lower(unit.code), unit);
  };

  known.forEach(add);

  return {
    byId,
    /** The unit an imported one is: same id, or same code, or same name and parent. */
    same: (unit: ImportedUnit, parentId: string) =>
      byId.get(unit.id) ??
      (unit.code ? byCode.get(lower(unit.code)) : byName.get(named(unit.name, parentId))),
    add,
  };
};

/** Where each imported unit goes: an existing unit, or a new row under its (mapped) parent. */
const plan = (known: Known[], units: ImportedUnit[]) => {
  const top = known.find((unit) => unit.parentId === null);

  if (!top) throw new Error('The organisation has no top unit');

  const index = indexOf(known);
  const ids: Record<string, string> = {};
  const inserts: (Known & ImportedUnit)[] = [];

  for (const unit of parentsFirst(units)) {
    const mapped = unit.parentId ? (ids[unit.parentId] ?? unit.parentId) : null;

    const parent = (mapped ? index.byId.get(mapped) : undefined) ?? top;
    const match = index.same(unit, parent.id);

    if (match) {
      ids[unit.id] = match.id;
      continue;
    }

    const row = {
      ...unit,
      parentId: parent.id,
      path: `${parent.path}${unit.id}/`,
      code: unit.code ?? null,
    };

    assertDepth(depthOf(row.path));
    inserts.push(row);
    index.add(row);
    ids[unit.id] = unit.id;
  }

  return { ids, inserts };
};

const assertNeverDeleted = async (client: Db, ids: string[]) => {
  if (!ids.length) return;

  const [gone] = await client
    .select({ id: orgUnitTombstones.id })
    .from(orgUnitTombstones)
    .where(inArray(orgUnitTombstones.id, ids))
    .limit(1);

  if (gone) {
    throw fail('TAKEN', `${gone.id} was a unit that is deleted; its id can't be used again`, {
      field: 'id',
    });
  }
};

/**
 * Brings units in from a plugin's tables or old erxes, keeping their ids so records that name
 * them still match. A unit that is already here (by id, code, or name and parent) merges: its
 * members are added to that one. Members and supervisors not on the team are dropped.
 */
export const importUnits = async (client: Db, units: ImportedUnit[]) => {
  const known: Known[] = await client
    .select({
      id: orgUnits.id,
      name: orgUnits.name,
      code: orgUnits.code,
      parentId: orgUnits.parentId,
      path: orgUnits.path,
    })
    .from(orgUnits);

  const here = new Set(known.map((unit) => unit.id));
  const { ids, inserts } = plan(known, units);

  await assertNeverDeleted(
    client,
    inserts.map((row) => row.id),
  );

  const team = await teamMembers(
    client,
    units.flatMap((unit) => [unit.supervisorId, ...unit.memberIds]),
  );

  await assertRoom(client, inserts.length);

  const createdBy = actorOf(caller()).actorId;
  const types = await unitTypeRows(client);

  // A unit keeps the type it names when that is a type here; others get the first active one.
  const typeFor = (typeId: string | undefined) => {
    const type =
      types.find((candidate) => candidate.id === typeId) ??
      types.find((candidate) => candidate.isActive && !candidate.plugin);

    if (!type) throw fail('INVALID_REFERENCE', 'No active unit type', { field: 'typeId' });

    return type.id;
  };

  // One statement, parents first: its foreign keys are checked once every row is in.
  if (inserts.length) {
    await client.insert(orgUnits).values(
      inserts.map(({ memberIds: _members, supervisorId, ...row }) => ({
        ...row,
        typeId: typeFor(row.typeId),
        supervisorId: supervisorId && team.has(supervisorId) ? supervisorId : null,
        createdBy,
      })),
    );
  }

  const memberships = units.flatMap((unit) =>
    unit.memberIds.map((userId) => ({ unitId: ids[unit.id] ?? unit.id, userId })),
  );

  const kept = memberships.filter((row) => team.has(row.userId));

  const added = kept.length
    ? await client
        .insert(orgUnitMembers)
        .values(kept)
        .onConflictDoNothing()
        .returning({ unitId: orgUnitMembers.unitId })
    : [];

  const grown = [...new Set(added.map((row) => row.unitId))].filter((id) => here.has(id));

  await publishUnitEvents(client, 'created', inserts);
  await publishUnitEvents(
    client,
    'updated',
    grown.map((id) => ({ id, changed: ['memberIds'] })),
  );

  return { ids, skippedMembers: memberships.length - kept.length };
};
