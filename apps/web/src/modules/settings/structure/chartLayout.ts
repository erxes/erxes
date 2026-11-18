import type { UnitNode } from '@erxes/core-contract';
import type { IsOpen, TreeIndex } from './unitTree';

export const CARD_WIDTH = 248;
export const CARD_HEIGHT = 88;
const H_GAP = 24;
export const V_GAP = 64;
const ROW_GAP = 14;

/** Left offset of stacked children from their vertical connector. */
export const STACK_INDENT = 28;

/** More childless subunits than this stack in columns instead of one wide row. */
const STACK_AFTER = 6;
const STACK_ROWS = 8;

export const draftNodeId = (parentId: string) => `draft:${parentId}`;
const moreNodeId = (parentId: string) => `more:${parentId}`;

export type CardData = { unit: UnitNode; expanded: boolean };

export type MoreData = { parentId: string; left: number };

export type DraftData = { parentId: string };

type NodeBase = {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  style: typeof INTERACTIVE;
};

/**
 * React Flow turns pointer events off for nodes that can't be dragged or selected; the cards take
 * their own clicks, so they turn them back on.
 */
const INTERACTIVE = { pointerEvents: 'all' } as const;

export type ChartNode =
  | (NodeBase & { type: 'card'; data: CardData })
  | (NodeBase & { type: 'more'; data: MoreData })
  | (NodeBase & { type: 'draft'; data: DraftData });

type ChartEdge = {
  id: string;
  source: string;
  target: string;
  type: 'org';
  targetHandle: 'top' | 'left';
  data: { stacked: boolean };
};

type Box = {
  id: string;
  node:
    | { type: 'card'; data: CardData }
    | { type: 'more'; data: MoreData }
    | { type: 'draft'; data: DraftData };
  children: Box[];
  width: number;
};

type Slot =
  | { kind: 'box'; box: Box }
  | { kind: 'stack'; boxes: Box[]; rows: number; width: number };

const span = (widths: number[]) =>
  widths.reduce((sum, width) => sum + width, 0) + H_GAP * Math.max(widths.length - 1, 0);

/** Childless children beyond STACK_AFTER go into compact columns on the left. */
const slotsOf = (box: Box): Slot[] => {
  const leaves = box.children.filter((child) => !child.children.length);

  if (leaves.length <= STACK_AFTER)
    return box.children.map((child) => ({ kind: 'box', box: child }));

  const columns = Math.ceil(leaves.length / STACK_ROWS);

  return [
    {
      kind: 'stack',
      boxes: leaves,
      rows: Math.ceil(leaves.length / columns),
      width: span(Array.from({ length: columns }, () => STACK_INDENT + CARD_WIDTH)),
    },
    ...box.children
      .filter((child) => child.children.length)
      .map((child): Slot => ({ kind: 'box', box: child })),
  ];
};

const slotWidth = (slot: Slot) => (slot.kind === 'stack' ? slot.width : slot.box.width);

const measure = (box: Box) => {
  box.width = Math.max(CARD_WIDTH, span(slotsOf(box).map(slotWidth)));

  return box;
};

const leaf = (id: string, node: Box['node']): Box => ({
  id,
  node,
  children: [],
  width: CARD_WIDTH,
});

/** The open part of the tree as boxes, each as wide as what hangs under it. */
const boxOf = (index: TreeIndex, isOpen: IsOpen, draftParentId: string | null) => {
  const toBox = (unit: UnitNode): Box => {
    const expanded = isOpen(unit);
    const more = index.more.get(unit.id);

    const children = expanded
      ? [
          ...(index.children.get(unit.id) ?? []).map(toBox),
          ...(more
            ? [
                leaf(moreNodeId(unit.id), {
                  type: 'more',
                  data: { parentId: unit.id, left: more.left },
                }),
              ]
            : []),
          ...(draftParentId === unit.id
            ? [leaf(draftNodeId(unit.id), { type: 'draft', data: { parentId: unit.id } })]
            : []),
        ]
      : [];

    return measure({
      id: unit.id,
      node: { type: 'card', data: { unit, expanded } },
      children,
      width: 0,
    });
  };

  return toBox(index.root);
};

/** Top-down org chart positions for the open part of the tree. */
export const layoutChart = (index: TreeIndex, isOpen: IsOpen, draftParentId: string | null) => {
  const nodes: ChartNode[] = [];
  const edges: ChartEdge[] = [];

  const place = (box: Box, x: number, y: number) =>
    nodes.push({
      id: box.id,
      position: { x, y },
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      style: INTERACTIVE,
      ...box.node,
    });

  const connect = (source: string, target: string, stacked: boolean) =>
    edges.push({
      id: `${source}->${target}`,
      source,
      target,
      type: 'org',
      targetHandle: stacked ? 'left' : 'top',
      data: { stacked },
    });

  const assign = (box: Box, left: number, y: number) => {
    place(box, left + (box.width - CARD_WIDTH) / 2, y);

    const slots = slotsOf(box);
    const childY = y + CARD_HEIGHT + V_GAP;
    let cursor = left + (box.width - span(slots.map(slotWidth))) / 2;

    for (const slot of slots) {
      if (slot.kind === 'stack') {
        const stackLeft = cursor;

        slot.boxes.forEach((child, i) => {
          const column = Math.floor(i / slot.rows);

          place(
            child,
            stackLeft + column * (STACK_INDENT + CARD_WIDTH + H_GAP) + STACK_INDENT,
            childY + (i % slot.rows) * (CARD_HEIGHT + ROW_GAP),
          );
          connect(box.id, child.id, true);
        });
      } else {
        connect(box.id, slot.box.id, false);
        assign(slot.box, cursor, childY);
      }

      cursor += slotWidth(slot) + H_GAP;
    }
  };

  assign(boxOf(index, isOpen, draftParentId), 0, 0);

  return { nodes, edges };
};
