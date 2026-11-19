import type { UnitNode } from '@erxes/core-contract';
import type { TreeIndex } from './unitTree';

const H_GAP = 32;
const V_GAP = 56;

/** The card of the person who leads a unit, and the room between it and the unit's frame. */
const HEAD = { width: 228, height: 64, gap: 32 };

/** A person inside a frame; the frame's cards size themselves with these same numbers. */
export const PERSON = { width: 188, height: 56, gap: 8 };

/** A frame: the room over its people for its name and counts, its padding, its last line. */
export const FRAME = { width: 276, top: 52, pad: 12, line: 36 };

/** A frame that shows no people: a bar with its name and counts. */
const CLOSED = { width: FRAME.width, height: 60 };

const OTHER = { draft: { width: 248, height: 88 }, more: { width: 248, height: 44 } };

/** People side by side in a frame; the next ones start a new row inside it. */
export const PEOPLE_COLUMNS = 4;

/** People a frame shows until asked for all. */
export const PEOPLE_SHOWN = 8;

/** The most people a frame shows; the rest are in the unit's People tab. */
export const PEOPLE_MAX = 100;

export const draftNodeId = (parentId: string) => `draft:${parentId}`;

export type HeadData = { unit: UnitNode };

export type FrameData = {
  unit: UnitNode;
  /** Its people and subunits show. */
  expanded: boolean;
  /** The people drawn in it, in order; none while it is closed or the team can't be listed. */
  people: string[];
  /** How many people are in it besides the one who leads it. */
  total: number;
};

export type MoreData = { parentId: string; left: number };

export type DraftData = { parentId: string };

type NodeKind =
  | { type: 'head'; data: HeadData }
  | { type: 'frame'; data: FrameData }
  | { type: 'more'; data: MoreData }
  | { type: 'draft'; data: DraftData };

/**
 * React Flow turns pointer events off for nodes that can't be dragged or selected; the cards take
 * their own clicks, so they turn them back on.
 */
const INTERACTIVE = { pointerEvents: 'all' } as const;

export type ChartNode = NodeKind & {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  style: typeof INTERACTIVE;
};

/** Elbow connectors with rounded corners, from a unit down to each unit under it. */
const EDGE = { type: 'smoothstep', pathOptions: { borderRadius: 8 } } as const;

type ChartEdge = typeof EDGE & { id: string; source: string; target: string };

type Size = { width: number; height: number };

type Part = Size & { id: string; node: NodeKind };

/** A unit's nodes from the top down, and what hangs under it, left to right. */
type Box = { parts: Part[]; children: Box[]; width: number };

type ChartInput = {
  index: TreeIndex;
  /** Whether a unit is drawn open: opened, and what it shows has loaded. */
  isOpen: (unit: UnitNode) => boolean;
  /**
   * Who is in an open unit besides the one who leads it. Null when the team can't be listed:
   * then frames hold no people and no unit starts with the card of who leads it.
   */
  people: ((unit: UnitNode) => string[]) | null;
  /** Whether a unit's frame shows everyone, not the first few. */
  showsAllPeople: (unitId: string) => boolean;
  draftParentId: string | null;
};

const span = (widths: number[]) =>
  widths.reduce((sum, width) => sum + width, 0) + H_GAP * Math.max(widths.length - 1, 0);

/** An open frame's size: its people `PEOPLE_COLUMNS` to a row, then a line when there is more to say. */
const openFrame = (shown: number, total: number): Size => {
  const columns = Math.min(PEOPLE_COLUMNS, Math.max(shown, 1));
  const rows = Math.ceil(shown / PEOPLE_COLUMNS);
  const saysMore = shown < total || !shown;

  return {
    width: Math.max(
      FRAME.width,
      FRAME.pad * 2 + columns * PERSON.width + (columns - 1) * PERSON.gap,
    ),
    height:
      FRAME.top +
      rows * PERSON.height +
      Math.max(rows - 1, 0) * PERSON.gap +
      (saysMore ? FRAME.line : 0) +
      FRAME.pad,
  };
};

const single = (id: string, node: NodeKind, size: Size): Box => ({
  parts: [{ id, node, ...size }],
  children: [],
  width: size.width,
});

/**
 * The open part of the tree as boxes: a unit is the card of who leads it over its frame, with
 * what hangs under it in one row. Under a unit come its loaded subunits in their order, then the
 * card that loads more, then the new unit being typed: always in that one order, so a card that
 * appears takes the next place at the right.
 */
const boxOf = ({ index, isOpen, people, showsAllPeople, draftParentId }: ChartInput) => {
  const toBox = (unit: UnitNode): Box => {
    const expanded = isOpen(unit);
    const everyone = expanded && people ? people(unit) : null;
    const shown = everyone?.slice(0, showsAllPeople(unit.id) ? PEOPLE_MAX : PEOPLE_SHOWN) ?? [];
    const more = index.more.get(unit.id);

    const frame: Part = {
      id: unit.id,
      node: {
        type: 'frame',
        data: { unit, expanded, people: shown, total: everyone?.length ?? 0 },
      },
      ...(everyone ? openFrame(shown.length, everyone.length) : CLOSED),
    };

    const head: Part = {
      id: `head:${unit.id}`,
      node: { type: 'head', data: { unit } },
      width: HEAD.width,
      height: HEAD.height,
    };

    const children = expanded
      ? [
          ...(index.children.get(unit.id) ?? []).map(toBox),
          ...(more
            ? [
                single(
                  `more:${unit.id}`,
                  { type: 'more', data: { parentId: unit.id, left: more.left } },
                  OTHER.more,
                ),
              ]
            : []),
          ...(draftParentId === unit.id
            ? [
                single(
                  draftNodeId(unit.id),
                  { type: 'draft', data: { parentId: unit.id } },
                  OTHER.draft,
                ),
              ]
            : []),
        ]
      : [];

    return {
      parts: people ? [head, frame] : [frame],
      children,
      width: Math.max(frame.width, HEAD.width, span(children.map((child) => child.width))),
    };
  };

  return toBox(index.root);
};

/**
 * Top-down org chart positions for the open part of the tree. A unit is the card of the person
 * who leads it, over a frame with its people; the units under it sit in one row below, left to
 * right in their order, and it is centred over them. The layout has this one rule at every size,
 * so a card that is added, opened or loaded only moves cards aside or down and never rearranges
 * them. A wide row is panned, or read in the tree.
 */
export const layoutChart = (input: ChartInput) => {
  const nodes: ChartNode[] = [];
  const edges: ChartEdge[] = [];

  const connect = (source: string, target: string) =>
    edges.push({ ...EDGE, id: `${source}->${target}`, source, target });

  const assign = (box: Box, left: number, top: number) => {
    let bottom = top;

    box.parts.forEach((part, i) => {
      const above = box.parts[i - 1];

      if (above) {
        bottom += HEAD.gap;
        connect(above.id, part.id);
      }

      nodes.push({
        id: part.id,
        position: { x: left + (box.width - part.width) / 2, y: bottom },
        width: part.width,
        height: part.height,
        style: INTERACTIVE,
        ...part.node,
      });
      bottom += part.height;
    });

    const last = box.parts.at(-1);
    let cursor = left + (box.width - span(box.children.map((child) => child.width))) / 2;

    for (const child of box.children) {
      const [first] = child.parts;

      if (last && first) connect(last.id, first.id);

      assign(child, cursor, bottom + V_GAP);
      cursor += child.width + H_GAP;
    }
  };

  assign(boxOf(input), 0, 0);

  return { nodes, edges };
};
