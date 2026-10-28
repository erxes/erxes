import type { IStructureEntityType } from 'ui-modules';
import {
  STRUCTURE_CANVAS_COMPACT_AFTER,
  STRUCTURE_CANVAS_COMPACT_ROWS,
  STRUCTURE_CANVAS_H_GAP,
  STRUCTURE_CANVAS_INDENT,
  STRUCTURE_CANVAS_NODE_HEIGHT,
  STRUCTURE_CANVAS_NODE_WIDTH,
  STRUCTURE_CANVAS_ROW_GAP,
  STRUCTURE_CANVAS_V_GAP,
} from '../constants/structureCanvas';
import type {
  TStructureCanvasEdge,
  TStructureCanvasNode,
} from '../types/structureCanvas';
import type { TStructureTreeEntity } from '../types/structureEntity';
import {
  getStructureCollapsedLabel,
  groupStructureTree,
} from './structureTree';

const SIZE = {
  width: STRUCTURE_CANVAS_NODE_WIDTH,
  height: STRUCTURE_CANVAS_NODE_HEIGHT,
};

type TLayoutItem<T> = {
  id: string;
  entity?: T;
  parentId?: string;
  depth: number;
  childCount: number;
  expanded: boolean;
  hiddenLabel?: string;
  children: TLayoutItem<T>[];
  width: number;
};

type TLayoutSlot<T> =
  | { kind: 'item'; item: TLayoutItem<T> }
  | { kind: 'compact'; items: TLayoutItem<T>[]; rows: number; width: number };

type TBuildOptions<T> = {
  entities: T[];
  typesById: Map<string, Pick<IStructureEntityType, 'name'>>;
  isExpanded: (entity: T, depth: number) => boolean;
  draftParentId?: string | null;
};

const INTERACTIVE_NODE_STYLE = { pointerEvents: 'all' } as const;

export const getStructureCanvasDraftId = (parentId: string) =>
  `draft:${parentId}`;

const spanOf = (widths: number[]) =>
  widths.reduce((sum, width) => sum + width, 0) +
  STRUCTURE_CANVAS_H_GAP * Math.max(widths.length - 1, 0);

const slotsOf = <T>(item: TLayoutItem<T>): TLayoutSlot<T>[] => {
  const leaves = item.children.filter(({ children }) => !children.length);

  if (leaves.length <= STRUCTURE_CANVAS_COMPACT_AFTER) {
    return item.children.map((child) => ({ kind: 'item', item: child }));
  }

  const columns = Math.ceil(leaves.length / STRUCTURE_CANVAS_COMPACT_ROWS);
  const compact: TLayoutSlot<T> = {
    kind: 'compact',
    items: leaves,
    rows: Math.ceil(leaves.length / columns),
    width: spanOf(
      Array.from(
        { length: columns },
        () => STRUCTURE_CANVAS_INDENT + STRUCTURE_CANVAS_NODE_WIDTH,
      ),
    ),
  };

  return [
    compact,
    ...item.children
      .filter(({ children }) => children.length)
      .map((child): TLayoutSlot<T> => ({ kind: 'item', item: child })),
  ];
};

const slotWidth = <T>(slot: TLayoutSlot<T>) =>
  slot.kind === 'compact' ? slot.width : slot.item.width;

export const buildStructureCanvas = <T extends TStructureTreeEntity>({
  entities,
  typesById,
  isExpanded,
  draftParentId,
}: TBuildOptions<T>) => {
  const { roots, childrenById } = groupStructureTree(entities);

  const measure = (item: TLayoutItem<T>) => {
    item.width = Math.max(
      STRUCTURE_CANVAS_NODE_WIDTH,
      spanOf(slotsOf(item).map(slotWidth)),
    );

    return item;
  };

  const draftOf = (parentId: string, depth: number): TLayoutItem<T> => ({
    id: getStructureCanvasDraftId(parentId),
    parentId,
    depth,
    childCount: 0,
    expanded: false,
    children: [],
    width: STRUCTURE_CANVAS_NODE_WIDTH,
  });

  const toItem = (entity: T, depth: number): TLayoutItem<T> => {
    const children = childrenById.get(entity._id) ?? [];
    const hasDraft = draftParentId === entity._id;
    const expanded = isExpanded(entity, depth) || hasDraft;
    const visible = expanded
      ? children.map((child) => toItem(child, depth + 1))
      : [];

    return measure({
      id: entity._id,
      entity,
      parentId: entity.parentId,
      depth,
      childCount: children.length,
      expanded,
      hiddenLabel:
        !expanded && children.length
          ? getStructureCollapsedLabel(children, typesById)
          : undefined,
      children: hasDraft
        ? [...visible, draftOf(entity._id, depth + 1)]
        : visible,
      width: 0,
    });
  };

  const nodes: TStructureCanvasNode[] = [];
  const edges: TStructureCanvasEdge[] = [];

  const place = (item: TLayoutItem<T>, x: number, y: number) => {
    const position = { x, y };

    if (item.entity) {
      nodes.push({
        id: item.id,
        type: 'card',
        position,
        style: INTERACTIVE_NODE_STYLE,
        ...SIZE,
        data: {
          entity: item.entity,
          depth: item.depth,
          childCount: item.childCount,
          expanded: item.expanded,
          hiddenLabel: item.hiddenLabel,
        },
      });
    } else if (item.parentId) {
      nodes.push({
        id: item.id,
        type: 'draft',
        position,
        style: INTERACTIVE_NODE_STYLE,
        ...SIZE,
        data: { parentId: item.parentId },
      });
    }
  };

  const connect = (parentId: string, childId: string, compact: boolean) =>
    edges.push({
      id: `${parentId}->${childId}`,
      source: parentId,
      target: childId,
      type: 'structure',
      targetHandle: compact ? 'left' : 'top',
      data: { compact },
    });

  const assign = (item: TLayoutItem<T>, left: number, y: number) => {
    place(item, left + (item.width - STRUCTURE_CANVAS_NODE_WIDTH) / 2, y);

    const slots = slotsOf(item);
    const childY = y + STRUCTURE_CANVAS_NODE_HEIGHT + STRUCTURE_CANVAS_V_GAP;
    let cursor = left + (item.width - spanOf(slots.map(slotWidth))) / 2;

    for (const slot of slots) {
      if (slot.kind === 'compact') {
        slot.items.forEach((child, index) => {
          const column = Math.floor(index / slot.rows);
          const row = index % slot.rows;

          place(
            child,
            cursor +
              column *
                (STRUCTURE_CANVAS_INDENT +
                  STRUCTURE_CANVAS_NODE_WIDTH +
                  STRUCTURE_CANVAS_H_GAP) +
              STRUCTURE_CANVAS_INDENT,
            childY +
              row * (STRUCTURE_CANVAS_NODE_HEIGHT + STRUCTURE_CANVAS_ROW_GAP),
          );
          connect(item.id, child.id, true);
        });
      } else {
        connect(item.id, slot.item.id, false);
        assign(slot.item, cursor, childY);
      }

      cursor += slotWidth(slot) + STRUCTURE_CANVAS_H_GAP;
    }
  };

  let rootLeft = 0;

  for (const root of roots) {
    const item = toItem(root, 0);

    assign(item, rootLeft, 0);
    rootLeft += item.width + STRUCTURE_CANVAS_H_GAP;
  }

  return { nodes, edges };
};
