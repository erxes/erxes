import type { Unit, UnitKind } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useUnits = (kind: UnitKind) =>
  useQuery(orpc.units.list.queryOptions({ input: { kind } }));

/** A unit with how deep it sits, for an indented list. */
export interface UnitRow {
  unit: Unit;
  depth: number;
}

/** Each unit after its parent, siblings by name: the tree read top down. */
export const treeRows = (units: Unit[]): UnitRow[] => {
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

/** Create, change and remove units; each refreshes the lists and reports a failure. */
export const useUnitMutations = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { toast } = useToast();
  const client = useQueryClient();

  const handlers = (failed: string) => ({
    onSuccess: () => void client.invalidateQueries({ queryKey: orpc.units.key() }),
    onError: (error: Error) =>
      toast({ variant: 'destructive', title: failed, description: messageOf(error) }),
  });

  return {
    create: useMutation(
      orpc.units.create.mutationOptions(handlers(t('create-failed', 'Could not add it'))),
    ),
    update: useMutation(
      orpc.units.update.mutationOptions(handlers(t('update-failed', 'Could not save it'))),
    ),
    remove: useMutation(
      orpc.units.remove.mutationOptions(handlers(t('remove-failed', 'Could not delete it'))),
    ),
  };
};
