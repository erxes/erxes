export interface ChartTreeItem {
  _id: string;
  parentId?: string | null;
  order?: string | null;
  title?: string | null;
  height?: number | null;
}

export interface ChartLayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  hGap?: number;
  vGap?: number;
}

export interface ChartLayoutResult {
  positions: Map<string, { x: number; y: number; depth: number }>;
  edges: { id: string; source: string; target: string }[];
  childrenById: Map<string, string[]>;
  rootIds: string[];
}

const compareItems = (a: ChartTreeItem, b: ChartTreeItem) => {
  const orderA = a.order ?? '';
  const orderB = b.order ?? '';
  if (orderA !== orderB) {
    return orderA.localeCompare(orderB, undefined, { numeric: true });
  }
  return (a.title ?? a._id).localeCompare(b.title ?? b._id, undefined, {
    numeric: true,
  });
};

export const buildChildrenMap = (
  items: ChartTreeItem[],
): Map<string, string[]> => {
  const ids = new Set(items.map((item) => item._id));
  const childrenById = new Map<string, string[]>();

  for (const item of items) {
    if (item.parentId && ids.has(item.parentId) && item.parentId !== item._id) {
      const children = childrenById.get(item.parentId) || [];
      children.push(item._id);
      childrenById.set(item.parentId, children);
    }
  }

  return childrenById;
};

export const getDescendantIds = (
  childrenById: Map<string, string[]>,
  id: string,
): Set<string> => {
  const descendants = new Set<string>();
  const queue = [...(childrenById.get(id) || [])];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current || descendants.has(current)) continue;
    descendants.add(current);
    queue.push(...(childrenById.get(current) || []));
  }

  return descendants;
};

export const getSubtreeIds = (
  childrenById: Map<string, string[]>,
  id: string,
): Set<string> => new Set([id, ...getDescendantIds(childrenById, id)]);

export const buildChartLayout = (
  items: ChartTreeItem[],
  collapsedIds: Set<string> = new Set(),
  options: ChartLayoutOptions = {},
): ChartLayoutResult => {
  const {
    nodeWidth = 264,
    nodeHeight = 120,
    hGap = 32,
    vGap = 56,
  } = options;

  const itemById = new Map(items.map((item) => [item._id, item]));
  const childrenById = buildChildrenMap(items);
  const childIds = new Set([...childrenById.values()].flat());
  const rootIds = items
    .filter((item) => !childIds.has(item._id))
    .sort(compareItems)
    .map((item) => item._id);

  const sortedChildren = new Map<string, ChartTreeItem[]>();
  for (const [parentId, childIds] of childrenById) {
    sortedChildren.set(
      parentId,
      childIds
        .map((id) => itemById.get(id))
        .filter((item): item is ChartTreeItem => !!item)
        .sort(compareItems),
    );
  }

  const depthHeights = new Map<number, number>();
  const positions = new Map<string, { x: number; y: number; depth: number }>();
  const edges: { id: string; source: string; target: string }[] = [];
  const visiting = new Set<string>();

  const getItemHeight = (id: string) =>
    itemById.get(id)?.height || nodeHeight;

  const measureDepths = (id: string, depth: number) => {
    if (visiting.has(id)) return;
    visiting.add(id);
    depthHeights.set(
      depth,
      Math.max(depthHeights.get(depth) || 0, getItemHeight(id)),
    );
    if (!collapsedIds.has(id)) {
      for (const child of sortedChildren.get(id) || []) {
        measureDepths(child._id, depth + 1);
      }
    }
    visiting.delete(id);
  };

  for (const rootId of rootIds) {
    measureDepths(rootId, 0);
  }

  const depthOffsets = new Map<number, number>();
  let offset = 0;
  for (let depth = 0; depthHeights.has(depth); depth += 1) {
    depthOffsets.set(depth, offset);
    offset += (depthHeights.get(depth) || nodeHeight) + vGap;
  }

  const layoutNode = (id: string, depth: number, startX: number): number => {
    if (positions.has(id) || visiting.has(id)) {
      return nodeWidth;
    }
    visiting.add(id);

    const children = collapsedIds.has(id)
      ? []
      : (sortedChildren.get(id) || []).map((child) => child._id);

    let width = nodeWidth;
    const childPositions: { id: string; x: number }[] = [];

    if (children.length > 0) {
      let cursor = startX;
      for (const childId of children) {
        const childWidth = layoutNode(childId, depth + 1, cursor);
        childPositions.push({ id: childId, x: cursor });
        cursor += childWidth + hGap;
        width = Math.max(width, cursor - hGap - startX);
      }
      const first = childPositions[0];
      const last = childPositions[childPositions.length - 1];
      const firstX = positions.get(first.id)?.x ?? first.x;
      const lastX = positions.get(last.id)?.x ?? last.x;
      const x = (firstX + lastX) / 2;
      positions.set(id, { x, y: depthOffsets.get(depth) ?? 0, depth });
      for (const childId of children) {
        edges.push({ id: `${id}-${childId}`, source: id, target: childId });
      }
    } else {
      positions.set(id, {
        x: startX,
        y: depthOffsets.get(depth) ?? 0,
        depth,
      });
    }

    visiting.delete(id);
    return Math.max(width, nodeWidth);
  };

  let cursor = 0;
  for (const rootId of rootIds) {
    const width = layoutNode(rootId, 0, cursor);
    cursor += width + hGap;
  }

  const hiddenIds = new Set<string>();
  for (const id of collapsedIds) {
    for (const descendant of getDescendantIds(childrenById, id)) {
      hiddenIds.add(descendant);
    }
  }

  for (const item of items) {
    if (!positions.has(item._id) && !hiddenIds.has(item._id)) {
      positions.set(item._id, { x: cursor, y: 0, depth: 0 });
      cursor += nodeWidth + hGap;
    }
  }

  return { positions, edges, childrenById, rootIds };
};
