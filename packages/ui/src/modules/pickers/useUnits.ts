import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { UnitQueries } from 'erxes-ui/modules/records/units';
import { treeRows } from 'erxes-ui/modules/tree/treeRows';

/**
 * Core's branches or departments: parents first, siblings by code.
 * Each has its `order` path and whether units sit under it; 3.x's `useBranchesMain` and
 * `useDepartmentsMain`.
 */
export const useUnits = (units: UnitQueries, kind: 'branch' | 'department') => {
  const query = useQuery(units.list(kind));
  const list = query.data?.data;

  const rows = useMemo(
    () => treeRows(list ?? [], (unit) => `${unit.code ?? ''} ${unit.name}`),
    [list],
  );

  return { units: rows, loading: query.isPending, error: query.error };
};
