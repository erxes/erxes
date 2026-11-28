/** A row of a tree in reading order, with its path and whether rows sit under it. */
export type TreeRow<T> = T & { order: string; hasChildren: boolean };

/**
 * Records with a `parentId` as a tree in reading order: each parent, then its children, siblings
 * by `sortKey`. A row's `order` is its ancestors' ids and its own, each ending in "/", as
 * `SelectTree` and `RecordTableTree` read it. A row whose parent is missing is a root.
 */
export const treeRows = <T extends { id: string; parentId: string | null }>(
  items: readonly T[],
  sortKey: (item: T) => string,
): TreeRow<T>[] => {
  const ids = new Set(items.map((item) => item.id));
  const children = new Map<string, T[]>();

  for (const item of items) {
    const parent = item.parentId && ids.has(item.parentId) ? item.parentId : '';

    children.set(parent, [...(children.get(parent) ?? []), item]);
  }

  const rows: TreeRow<T>[] = [];
  // A cycle in bad data would otherwise recurse forever.
  const seen = new Set<string>();

  const visit = (parent: string, prefix: string) => {
    const level = (children.get(parent) ?? []).toSorted((a, b) =>
      sortKey(a).localeCompare(sortKey(b)),
    );

    for (const item of level) {
      if (seen.has(item.id)) continue;

      seen.add(item.id);

      const order = `${prefix}${item.id}/`;

      rows.push({ ...item, order, hasChildren: (children.get(item.id) ?? []).length > 0 });
      visit(item.id, order);
    }
  };

  visit('', '');

  return rows;
};
