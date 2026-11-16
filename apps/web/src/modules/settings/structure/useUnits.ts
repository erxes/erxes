import type { Unit, UnitKind, UnitType } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useUnits = (kind: UnitKind) =>
  useQuery(orpc.units.list.queryOptions({ input: { kind } }));

export const useUnitTypes = (kind: UnitKind) =>
  useQuery(orpc.unitTypes.list.queryOptions({ input: { kind } }));

/** Active types a unit may have under `parent` (null: at the top), keeping its own. */
export const typesFor = (types: UnitType[], parentTypeId: string | null, current?: string) =>
  types.filter(
    (type) =>
      type.id === current ||
      (type.isActive &&
        (parentTypeId === null
          ? type.canBeRoot
          : !type.allowedParentTypeIds.length || type.allowedParentTypeIds.includes(parentTypeId))),
  );

/** A unit with how deep it sits, for an indented list. */
export interface UnitRow {
  unit: Unit;
  depth: number;
}

/** Each unit after its parent, siblings by name: the tree read top down. */
const treeRows = (units: Unit[]): UnitRow[] => {
  const ids = new Set(units.map((unit) => unit.id));
  const children = new Map<string | null, Unit[]>();

  for (const unit of units) {
    const parent = unit.parentId && ids.has(unit.parentId) ? unit.parentId : null;

    children.set(parent, [...(children.get(parent) ?? []), unit]);
  }

  const rows: UnitRow[] = [];

  const walk = (parent: string | null, depth: number) => {
    for (const unit of (children.get(parent) ?? []).toSorted((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      rows.push({ unit, depth });
      walk(unit.id, depth + 1);
    }
  };

  walk(null, 0);

  return rows;
};

/** How many units sit directly under each one. */
export const childCounts = (units: Unit[]) => {
  const counts = new Map<string, number>();

  for (const unit of units) {
    if (unit.parentId) counts.set(unit.parentId, (counts.get(unit.parentId) ?? 0) + 1);
  }

  return counts;
};

/** A unit's place in its tree, top down: `Head office › Region › Store 1`. */
export const pathLabel = (unit: Unit, byId: Map<string, Unit>) =>
  unit.path
    .split('/')
    .filter(Boolean)
    .map((id) => byId.get(id)?.name ?? '')
    .filter(Boolean)
    .join(' › ');

/**
 * The rows the tree shows: under a search, the units whose name or code match and the units
 * above them; otherwise every unit whose parents are all expanded.
 */
export const visibleRows = (units: Unit[], collapsed: Set<string>, search: string) => {
  const rows = treeRows(units);
  const term = search.trim().toLowerCase();

  if (term) {
    const hits = units.filter((unit) =>
      [unit.name, unit.code ?? ''].some((text) => text.toLowerCase().includes(term)),
    );

    const shown = new Set(hits.flatMap((unit) => unit.path.split('/').filter(Boolean)));

    return rows.filter(({ unit }) => shown.has(unit.id));
  }

  return rows.filter(
    ({ unit }) =>
      !unit.path
        .split('/')
        .filter((id) => id && id !== unit.id)
        .some((id) => collapsed.has(id)),
  );
};

/** Create, change and remove units; each refreshes the lists and reports a failure. */
export const useUnitMutations = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { toast } = useToast();
  const client = useQueryClient();

  const handlers = (failed: string) => ({
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: orpc.units.key() });
      void client.invalidateQueries({ queryKey: orpc.unitTypes.key() });
    },
    onError: (error: Error) =>
      toast({ variant: 'destructive', title: failed, description: messageOf(error) }),
  });

  const added = handlers(t('create-failed', 'Could not add it'));
  const saved = handlers(t('update-failed', 'Could not save it'));
  const removed = handlers(t('remove-failed', 'Could not delete it'));

  return {
    create: useMutation(orpc.units.create.mutationOptions(added)),
    update: useMutation(orpc.units.update.mutationOptions(saved)),
    remove: useMutation(orpc.units.remove.mutationOptions(removed)),
    createType: useMutation(orpc.unitTypes.create.mutationOptions(added)),
    updateType: useMutation(orpc.unitTypes.update.mutationOptions(saved)),
    removeType: useMutation(orpc.unitTypes.remove.mutationOptions(removed)),
  };
};
