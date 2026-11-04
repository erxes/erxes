import {
  STRUCTURE_CHART_NODE_HEIGHT,
  STRUCTURE_CHART_NODE_WIDTH,
} from '../constants/structureChart';
import {
  TStructureChartEdge,
  TStructureChartFlowNode,
  TStructureChartItem,
} from '../types/structureChart';

const PLACEHOLDER_PREFIX = 'placeholder:';
const H_GAP = 24;
const V_GAP = 56;

type TLayoutOptions = {
  collapsedIds: Set<string>;
  withPlaceholders: boolean;
};

export const buildStructureChart = (
  items: TStructureChartItem[],
  { collapsedIds, withPlaceholders }: TLayoutOptions,
) => {
  const itemsById = new Map(items.map((item) => [item._id, item]));
  const childrenOf = new Map<string, string[]>();
  const roots: string[] = [];

  for (const item of items) {
    // A parent filtered out of the result makes the item a root
    if (item.parentId && itemsById.has(item.parentId)) {
      childrenOf.set(item.parentId, [
        ...(childrenOf.get(item.parentId) ?? []),
        item._id,
      ]);
    } else {
      roots.push(item._id);
    }
  }

  const isPlaceholder = (id: string) => id.startsWith(PLACEHOLDER_PREFIX);

  const visibleChildren = (id: string): string[] => {
    if (isPlaceholder(id) || collapsedIds.has(id)) {
      return [];
    }

    const children = childrenOf.get(id) ?? [];

    return withPlaceholders
      ? [...children, `${PLACEHOLDER_PREFIX}${id}`]
      : children;
  };

  // Subtrees are measured first so sibling subtrees never overlap
  const widths = new Map<string, number>();
  const spanOf = (ids: string[]) =>
    ids.reduce((sum, id) => sum + (widths.get(id) ?? 0), 0) +
    H_GAP * Math.max(ids.length - 1, 0);

  const measure = (id: string) => {
    const children = visibleChildren(id);
    children.forEach(measure);
    widths.set(id, Math.max(STRUCTURE_CHART_NODE_WIDTH, spanOf(children)));
  };

  const countDescendants = (id: string): number =>
    (childrenOf.get(id) ?? []).reduce(
      (sum, child) => sum + 1 + countDescendants(child),
      0,
    );

  const nodes: TStructureChartFlowNode[] = [];
  const edges: TStructureChartEdge[] = [];

  const assign = (
    id: string,
    left: number,
    depth: number,
    parentId?: string,
  ) => {
    const width = widths.get(id) ?? 0;
    const children = visibleChildren(id);
    let cursor = left + (width - spanOf(children)) / 2;

    for (const child of children) {
      assign(child, cursor, depth + 1, id);
      cursor += (widths.get(child) ?? 0) + H_GAP;
    }

    const position = {
      x: left + (width - STRUCTURE_CHART_NODE_WIDTH) / 2,
      y: depth * (STRUCTURE_CHART_NODE_HEIGHT + V_GAP),
    };

    if (parentId && isPlaceholder(id)) {
      nodes.push({ id, type: 'placeholder', position, data: { parentId } });
      edges.push({
        id: `${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'structure',
        data: { isPlaceholder: true },
      });
      return;
    }

    const item = itemsById.get(id);

    if (!item) {
      return;
    }

    nodes.push({
      id,
      type: 'structure',
      position,
      data: {
        ...item,
        childCount: childrenOf.get(id)?.length ?? 0,
        hiddenCount: collapsedIds.has(id) ? countDescendants(id) : 0,
      },
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'structure',
        data: { childCode: item.code },
      });
    }
  };

  let rootLeft = 0;

  for (const root of roots) {
    measure(root);
    assign(root, rootLeft, 0);
    rootLeft += (widths.get(root) ?? 0) + H_GAP;
  }

  return { nodes, edges };
};
