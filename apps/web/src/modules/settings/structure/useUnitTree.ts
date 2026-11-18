import type { UnitNode } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { skipToken, useQueries, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { ancestorIds, buildIndex, type ChildPage, nodeOf, PAGE_SIZE } from './unitTree';

type PageRequest = { id: string; cursor: string | undefined };

/** Each opened unit's pages that have loaded, in order, up to the first still loading. */
const loadedPages = (requests: PageRequest[], results: UseQueryResult<ChildPage>[]) => {
  const byParent = new Map<string, { pages: ChildPage[]; waiting: boolean }>();

  requests.forEach((request, i) => {
    const entry = byParent.get(request.id) ?? { pages: [], waiting: false };
    const data = results[i]?.data;

    if (data && !entry.waiting) entry.pages.push(data);
    else entry.waiting = true;

    byParent.set(request.id, entry);
  });

  return {
    loaded: [...byParent].map(([parentId, { pages }]) => ({ parentId, pages })),
    loading: new Set(
      [...byParent].filter(([, entry]) => !entry.pages.length).map(([parentId]) => parentId),
    ),
  };
};

/**
 * The selected unit and the units above it, from the top; while inactive units are left out,
 * the chain stops at the first inactive one.
 */
const useSelectedChain = (selectedId: string | null, includeInactive: boolean) => {
  const target = useQuery(
    orpc.units.get.queryOptions({ input: selectedId ? { id: selectedId } : skipToken }),
  );

  const above = useQuery(
    orpc.units.ancestors.queryOptions({
      input: selectedId ? { id: selectedId, includeInactive: true } : skipToken,
    }),
  );

  const chain = [...(above.data?.data ?? []), ...(target.data ? [nodeOf(target.data)] : [])];
  const firstOff = includeInactive ? -1 : chain.findIndex((unit) => !unit.isActive);

  return {
    pins: firstOff === -1 ? chain : chain.slice(0, firstOff),
    above: new Set(target.data ? ancestorIds(target.data) : []),
  };
};

/** The loaded pages of each open unit, one `units.children` call per page. */
const useChildPages = (
  openIds: string[],
  cursors: Map<string, string[]>,
  includeInactive: boolean,
) => {
  const requests = openIds.flatMap((id) =>
    [undefined, ...(cursors.get(id) ?? [])].map((cursor): PageRequest => ({ id, cursor })),
  );

  const results = useQueries({
    queries: requests.map(({ id, cursor }) =>
      orpc.units.children.queryOptions({
        input: { id, cursor, limit: PAGE_SIZE, includeInactive },
      }),
    ),
  });

  return { ...loadedPages(requests, results), failed: results.find((result) => result.isError) };
};

/**
 * The structure as far as it is opened. The organisation's own unit is open from the start; a
 * unit's subunits load when it opens, a page at a time. The selected unit and the units above it
 * are pinned in, and open, even before their pages load.
 */
export const useUnitTree = (selectedId: string | null) => {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [toggled, setToggled] = useState(new Map<string, boolean>());
  const [cursors, setCursors] = useState(new Map<string, string[]>());
  const rootQuery = useQuery(orpc.units.root.queryOptions({ input: {} }));
  const selected = useSelectedChain(selectedId, includeInactive);
  const rootId = rootQuery.data?.id;

  const opened = (id: string) => toggled.get(id) ?? (id === rootId || selected.above.has(id));

  const openIds = [...new Set([rootId ?? '', ...toggled.keys(), ...selected.above])].filter(
    (id) => id && opened(id),
  );

  const { loaded, loading, failed } = useChildPages(openIds, cursors, includeInactive);

  const index = rootQuery.data ? buildIndex(nodeOf(rootQuery.data), loaded, selected.pins) : null;

  const setOpen = (unit: UnitNode, open: boolean) => {
    const next = new Map(toggled);

    if (!open)
      for (const id of toggled.keys()) {
        const known = index?.byId.get(id);

        if (known && id !== unit.id && known.path.startsWith(unit.path)) next.delete(id);
      }

    setToggled(next.set(unit.id, open));
  };

  return {
    rootQuery,
    index,
    loading,
    failed: failed?.error ?? null,
    retry: () => void failed?.refetch(),
    includeInactive,
    setIncludeInactive: (value: boolean) => {
      setIncludeInactive(value);
      setCursors(new Map());
    },
    isOpen: (unit: UnitNode) => opened(unit.id),
    setOpen,
    openAbove: (unit: Pick<UnitNode, 'id' | 'path'>) =>
      setToggled(
        new Map([...toggled, ...ancestorIds(unit).map((id): [string, boolean] => [id, true])]),
      ),
    expandAll: () =>
      setToggled(
        new Map(
          [...(index?.byId.values() ?? [])]
            .filter((unit) => unit.childCount > 0)
            .map((unit): [string, boolean] => [unit.id, true]),
        ),
      ),
    collapseAll: () =>
      setToggled(
        new Map(
          [...(index?.byId.keys() ?? [])]
            .filter((id) => id !== rootId)
            .map((id): [string, boolean] => [id, false]),
        ),
      ),
    loadMore: (parentId: string) => {
      const more = index?.more.get(parentId);

      if (more)
        setCursors(
          new Map(cursors).set(parentId, [...(cursors.get(parentId) ?? []), more.nextCursor]),
        );
    },
  };
};

export type UnitTree = ReturnType<typeof useUnitTree>;
