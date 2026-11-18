import { isRecord } from '@/deals/utils/dealJson';
import { nanoid } from 'nanoid';
import type { PosSlotsQuery, SlotInput } from '~/gql/graphql';
import {
  SLOT_CANVAS,
  SLOT_DEFAULT_COLOR,
  SLOT_DEFAULT_SIZE,
  SLOT_GRID_LAYOUT,
  SLOT_MIN_SIZE,
} from '@/pos/slot/constants';
import type { SlotNode, SlotNodePatch } from '@/pos/slot/types';

type SavedSlot = NonNullable<NonNullable<PosSlotsQuery['posSlots']>[number]>;

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getSlotSize = (node: SlotNode) => ({
  width: node.width ?? node.measured?.width ?? SLOT_DEFAULT_SIZE.WIDTH,
  height: node.height ?? node.measured?.height ?? SLOT_DEFAULT_SIZE.HEIGHT,
});

const clampPosition = (
  position: { x: number; y: number },
  size: { width: number; height: number },
) => ({
  x: clamp(position.x, 0, Math.max(0, SLOT_CANVAS.WIDTH - size.width)),
  y: clamp(position.y, 0, Math.max(0, SLOT_CANVAS.HEIGHT - size.height)),
});

export const toSlotNodes = (slots: PosSlotsQuery['posSlots']): SlotNode[] =>
  (slots ?? [])
    .filter((slot): slot is SavedSlot & { _id: string } => Boolean(slot?._id))
    .map((slot) => {
      const option = isRecord(slot.option) ? slot.option : {};
      const width = toNumber(option.width, SLOT_DEFAULT_SIZE.WIDTH);
      const height = toNumber(option.height, SLOT_DEFAULT_SIZE.HEIGHT);

      return {
        id: slot._id,
        type: 'slot',
        position: clampPosition(
          { x: toNumber(option.left, 0), y: toNumber(option.top, 0) },
          { width, height },
        ),
        width,
        height,
        zIndex: toNumber(option.zIndex, 0),
        data: {
          name: slot.name || slot.code || '',
          code: slot.code || slot._id,
          color:
            typeof option.color === 'string' && option.color
              ? option.color
              : SLOT_DEFAULT_COLOR,
          rounded: toNumber(option.borderRadius, 0),
          rotateAngle: toNumber(option.rotateAngle, 0),
          option,
        },
      };
    });

export const toSlotInputs = (nodes: SlotNode[], posId: string): SlotInput[] =>
  nodes.map((node) => {
    const { width, height } = getSlotSize(node);

    return {
      _id: node.id,
      posId,
      name: node.data.name,
      code: node.data.code,
      option: {
        isShape: false,
        ...node.data.option,
        width: Math.round(width),
        height: Math.round(height),
        top: Math.round(node.position.y),
        left: Math.round(node.position.x),
        rotateAngle: node.data.rotateAngle,
        borderRadius: node.data.rounded,
        color: node.data.color,
        zIndex: node.zIndex ?? 0,
      },
    };
  });

const nextSlotCode = (nodes: SlotNode[]) => {
  const codes = nodes
    .map((node) => Number.parseInt(node.data.code, 10))
    .filter(Number.isFinite);
  const used = new Set(nodes.map((node) => node.data.code));
  let next = codes.length ? Math.max(...codes) + 1 : 1;

  while (used.has(String(next))) next += 1;

  return String(next);
};

const freeGridPosition = (nodes: SlotNode[]) => {
  const { COLUMNS, GAP, START } = SLOT_GRID_LAYOUT;
  const step = SLOT_DEFAULT_SIZE.WIDTH + GAP;
  const overlaps = (x: number, y: number) =>
    nodes.some((node) => {
      const { width, height } = getSlotSize(node);
      return (
        x < node.position.x + width &&
        node.position.x < x + SLOT_DEFAULT_SIZE.WIDTH &&
        y < node.position.y + height &&
        node.position.y < y + SLOT_DEFAULT_SIZE.HEIGHT
      );
    });

  for (let index = 0; index < 200; index += 1) {
    const x = START + (index % COLUMNS) * step;
    const y = START + Math.floor(index / COLUMNS) * step;
    if (y + SLOT_DEFAULT_SIZE.HEIGHT > SLOT_CANVAS.HEIGHT) break;
    if (!overlaps(x, y)) return { x, y };
  }

  return { x: START, y: START };
};

export const createSlotNode = (nodes: SlotNode[], name: string): SlotNode => {
  const code = nextSlotCode(nodes);

  return {
    id: nanoid(),
    type: 'slot',
    position: freeGridPosition(nodes),
    width: SLOT_DEFAULT_SIZE.WIDTH,
    height: SLOT_DEFAULT_SIZE.HEIGHT,
    zIndex: 0,
    selected: true,
    data: {
      name: `${name} ${code}`,
      code,
      color: SLOT_DEFAULT_COLOR,
      rounded: 0,
      rotateAngle: 0,
      option: {},
    },
  };
};

export const duplicateSlotNode = (
  nodes: SlotNode[],
  source: SlotNode,
): SlotNode => {
  const code = nextSlotCode(nodes);
  const size = getSlotSize(source);

  return {
    ...source,
    id: nanoid(),
    selected: true,
    dragging: false,
    position: clampPosition(
      { x: source.position.x + 20, y: source.position.y + 20 },
      size,
    ),
    data: { ...source.data, code, name: `${source.data.name} (${code})` },
  };
};

export const applySlotPatch = (
  node: SlotNode,
  patch: SlotNodePatch,
): SlotNode => {
  const { x, y, width, height, zIndex, ...data } = patch;
  const size = getSlotSize(node);
  const nextSize = {
    width: Math.max(SLOT_MIN_SIZE, width ?? size.width),
    height: Math.max(SLOT_MIN_SIZE, height ?? size.height),
  };

  return {
    ...node,
    ...nextSize,
    zIndex: zIndex ?? node.zIndex,
    position: clampPosition(
      { x: x ?? node.position.x, y: y ?? node.position.y },
      nextSize,
    ),
    data: { ...node.data, ...data },
  };
};

export const arrangeSlotNodes = (nodes: SlotNode[]): SlotNode[] => {
  const { COLUMNS, GAP, START } = SLOT_GRID_LAYOUT;
  const columnWidth = Math.max(
    SLOT_DEFAULT_SIZE.WIDTH,
    ...nodes.map((node) => getSlotSize(node).width),
  );
  const rowHeight = Math.max(
    SLOT_DEFAULT_SIZE.HEIGHT,
    ...nodes.map((node) => getSlotSize(node).height),
  );

  return nodes.map((node, index) => ({
    ...node,
    position: clampPosition(
      {
        x: START + (index % COLUMNS) * (columnWidth + GAP),
        y: START + Math.floor(index / COLUMNS) * (rowHeight + GAP),
      },
      getSlotSize(node),
    ),
  }));
};
