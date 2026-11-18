import { db } from '@erxes/core-db';
import { audited, recordOf, scoped } from '~/orpc';
import { findUnitDetail, rootUnit, unitPage } from './unitRows';
import { searchUnits, unitAncestors, unitChildren } from './unitTree';
import { importUnits } from './units.import';
import {
  assignUnits,
  createUnit,
  moveUnit,
  removeUnit,
  reorderUnits,
  updateUnit,
} from './units.service';
import {
  createUnitType,
  importUnitTypes,
  removeUnitType,
  unitTypeRows,
  updateUnitType,
} from './unitTypes.service';

/** Members with `structure.manage` and plugins with `units:write` change them; each write is audited. */
export const unitsRouter = {
  list: scoped.units.list.handler(({ input }) => unitPage(db(), input)),
  root: scoped.units.root.handler(() => rootUnit(db())),
  search: scoped.units.search.handler(async ({ input }) => ({
    data: await searchUnits(db(), input),
  })),
  get: scoped.units.get.handler(({ input }) => findUnitDetail(db(), input.id)),
  children: scoped.units.children.handler(({ input }) => unitChildren(db(), input)),
  ancestors: scoped.units.ancestors.handler(async ({ input }) => ({
    data: await unitAncestors(db(), input),
  })),
  create: scoped.units.create.handler(({ input }) =>
    audited(
      (tx) => createUnit(tx, input),
      (unit) => recordOf('unit', 'created', unit.id, unit),
    ),
  ),
  update: scoped.units.update.handler(({ input: { id, ...changes } }) =>
    audited(
      (tx) => updateUnit(tx, id, changes),
      (unit) => ({ ...recordOf('unit', 'updated', id, unit), metadata: changes }),
    ),
  ),
  move: scoped.units.move.handler(({ input }) =>
    audited(
      (tx) => moveUnit(tx, input.id, input.parentId),
      ({ unit, moved }) =>
        moved
          ? [
              {
                ...recordOf('unit', 'moved', unit.id, unit),
                changes: { parentId: [moved.from, moved.to] },
                metadata: { units: moved.units, members: moved.members },
              },
            ]
          : [],
    ).then(({ unit }) => unit),
  ),
  reorder: scoped.units.reorder.handler(({ input }) =>
    audited(
      (tx) => reorderUnits(tx, input.id, input.unitIds),
      () => ({
        ...recordOf('unit', 'reordered', input.id),
        metadata: { unitIds: input.unitIds },
      }),
    ).then(() => ({ ok: true as const })),
  ),
  remove: scoped.units.remove.handler(({ input }) =>
    audited(
      async (tx) => removeUnit(tx, input.id),
      (unit) => recordOf('unit', 'deleted', unit.id, unit),
    ).then(() => ({ ok: true as const })),
  ),
  assign: scoped.units.assign.handler(({ input }) =>
    audited(
      (tx) => assignUnits(tx, input),
      () => ({
        ...recordOf('user', 'units_assigned', input.userId),
        metadata: { unitIds: input.unitIds },
      }),
    ),
  ),
  import: scoped.units.import.handler(({ input }) =>
    audited(
      (tx) => importUnits(tx, input.units),
      (result) => ({
        action: 'unit.imported',
        targetType: 'unit',
        metadata: { count: input.units.length, skippedMembers: result.skippedMembers },
      }),
    ),
  ),
};

/** Unit types: written like units, by the same members and plugins. */
export const unitTypesRouter = {
  list: scoped.unitTypes.list.handler(async () => ({ data: await unitTypeRows(db()) })),
  create: scoped.unitTypes.create.handler(({ input }) =>
    audited(
      (tx) => createUnitType(tx, input),
      (type) => recordOf('unit_type', 'created', type.id, type),
    ),
  ),
  update: scoped.unitTypes.update.handler(({ input: { id, ...changes } }) =>
    audited(
      (tx) => updateUnitType(tx, id, changes),
      (type) => ({ ...recordOf('unit_type', 'updated', id, type), metadata: changes }),
    ),
  ),
  remove: scoped.unitTypes.remove.handler(({ input }) =>
    audited(
      (tx) => removeUnitType(tx, input.id),
      (type) => recordOf('unit_type', 'deleted', type.id, type),
    ).then(() => ({ ok: true as const })),
  ),
  import: scoped.unitTypes.import.handler(({ input }) =>
    audited(
      (tx) => importUnitTypes(tx, input.types),
      () => ({
        action: 'unit_type.imported',
        targetType: 'unit_type',
        metadata: { count: input.types.length },
      }),
    ),
  ),
};
