import { db } from '@erxes/core-db';
import { audited, recordOf, scoped } from '~/orpc';
import { findUnit, unitRows } from './unitRows';
import { importUnits } from './units.import';
import { assignUnits, createUnit, removeUnit, updateUnit } from './units.service';

/** Members with `structure.manage` and plugins with `units:write` change them; each write is audited. */
export const unitsRouter = {
  list: scoped.units.list.handler(async ({ input }) => ({ data: await unitRows(db(), input) })),
  get: scoped.units.get.handler(({ input }) => findUnit(db(), input.id)),
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
        metadata: { kind: input.kind, unitIds: input.unitIds },
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
