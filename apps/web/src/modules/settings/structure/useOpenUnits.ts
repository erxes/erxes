import type { UnitDetail } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQueries } from '@tanstack/react-query';
import { useWorkspace } from './context';

/**
 * Each open unit as `units.get` reads it, with who is in it, for the chart's frames. Read only
 * while `enabled`; the organisation's own unit came with the page.
 */
export const useOpenUnits = (enabled: boolean) => {
  const { openIds, rootQuery } = useWorkspace();
  const root = rootQuery.data;

  return useQueries({
    queries: openIds
      .filter((id) => id !== root?.id)
      .map((id) => ({ ...orpc.units.get.queryOptions({ input: { id } }), enabled })),
    combine: (results) =>
      new Map(
        [...(root ? [root] : []), ...results.flatMap((result) => result.data ?? [])].map(
          (unit): [string, UnitDetail] => [unit.id, unit],
        ),
      ),
  });
};
