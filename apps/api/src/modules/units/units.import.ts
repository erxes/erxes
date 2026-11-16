import type { UnitKind } from '@erxes/core-contract';
import { actorOf, caller, type Db, orgUnitMembers, orgUnits } from '@erxes/core-db';
import { fail } from '~/http/errors';
import { assertRoom, publishUnitEvents, teamMembers } from './unitRows';
import type { UnitFields } from './units.service';
import { unitTypeRows } from './unitTypes.service';

export type ImportedUnit = Omit<UnitFields, 'memberIds'> & {
  id: string;
  kind: UnitKind;
  name: string;
  memberIds: string[];
};

interface Known {
  id: string;
  kind: UnitKind;
  name: string;
  code: string | null;
  parentId: string | null;
  path: string;
}

const lower = (value: string | null | undefined) => value?.trim().toLowerCase() ?? null;

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

/** The unit an imported one is: same id, or same kind and code, or same kind, name and parent. */
const sameUnit = (known: Known[], unit: ImportedUnit, parentId: string | null) =>
  known.find((other) => other.id === unit.id) ??
  known.find(
    (other) =>
      other.kind === unit.kind &&
      (unit.code
        ? lower(other.code) === lower(unit.code)
        : lower(other.name) === lower(unit.name) && other.parentId === parentId),
  );

/** Where each imported unit goes: an existing unit, or a new row under its (mapped) parent. */
const plan = (known: Known[], units: ImportedUnit[]) => {
  const ids: Record<string, string> = {};
  const inserts: (Known & ImportedUnit)[] = [];

  for (const unit of parentsFirst(units)) {
    const mapped = unit.parentId ? (ids[unit.parentId] ?? unit.parentId) : null;
    const parent = known.find((other) => other.id === mapped && other.kind === unit.kind);
    const match = sameUnit(known, unit, parent?.id ?? null);

    if (match && match.kind !== unit.kind) {
      throw fail('INVALID_REFERENCE', `${unit.id} is a ${match.kind}, not a ${unit.kind}`, {
        field: 'units',
      });
    }

    if (match) {
      ids[unit.id] = match.id;
      continue;
    }

    const row = {
      ...unit,
      parentId: parent?.id ?? null,
      path: `${parent?.path ?? '/'}${unit.id}/`,
      code: unit.code ?? null,
    };

    inserts.push(row);
    known.push(row);
    ids[unit.id] = unit.id;
  }

  return { ids, inserts };
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
      kind: orgUnits.kind,
      name: orgUnits.name,
      code: orgUnits.code,
      parentId: orgUnits.parentId,
      path: orgUnits.path,
    })
    .from(orgUnits);

  const { ids, inserts } = plan(known, units);

  const team = await teamMembers(
    client,
    units.flatMap((unit) => [unit.supervisorId, ...unit.memberIds]),
  );

  await assertRoom(client, inserts.length);

  const createdBy = actorOf(caller()).actorId;
  const types = await unitTypeRows(client);

  // A unit keeps the type it names when that is one of its kind; others get the kind's default.
  const typeFor = (kind: UnitKind, typeId: string | undefined) => {
    const named = types.find((type) => type.id === typeId && type.kind === kind);
    const fallback = types.find((type) => type.kind === kind && type.isActive);
    const type = named ?? fallback;

    if (!type) throw fail('INVALID_REFERENCE', `No active ${kind} type`, { field: 'typeId' });

    return type.id;
  };

  // One statement, parents first: its foreign keys are checked once every row is in.
  if (inserts.length) {
    await client.insert(orgUnits).values(
      inserts.map(({ memberIds: _members, supervisorId, ...row }) => ({
        ...row,
        typeId: typeFor(row.kind, row.typeId),
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

  const createdIds = new Set(inserts.map((row) => row.id));
  const kindOf = new Map(known.map((unit) => [unit.id, unit.kind]));
  const grown = [...new Set(added.map((row) => row.unitId))].filter((id) => !createdIds.has(id));

  await publishUnitEvents(client, 'created', inserts);
  await publishUnitEvents(
    client,
    'updated',
    grown.flatMap((id) => {
      const kind = kindOf.get(id);

      return kind ? [{ id, kind, changed: ['memberIds'] }] : [];
    }),
  );

  return { ids, skippedMembers: memberships.length - kept.length };
};
