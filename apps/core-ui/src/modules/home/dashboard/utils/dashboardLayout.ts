import { DASHBOARD_GRID_COLUMNS } from '../constants/dashboardGrid';
import type { TDashboardItem, TDashboardWidgetDefinition } from '../types/dashboardTypes';

type TRect = Pick<TDashboardItem, 'x' | 'y' | 'w' | 'h'>;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const overlaps = (a: TRect, b: TRect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export const bottomOf = (items: TRect[]) =>
  items.reduce((max, { y, h }) => Math.max(max, y + h), 0);

export const byPosition = (a: TRect, b: TRect) => a.y - b.y || a.x - b.x;

/**
 * A widget's size limits win over an older saved size, so a tile never comes
 * back squeezed after its minimum grew.
 */
export const fitToWidget = (
  item: TDashboardItem,
  widget: TDashboardWidgetDefinition,
): TDashboardItem => {
  const maxW = Math.min(widget.maxSize?.w ?? DASHBOARD_GRID_COLUMNS, DASHBOARD_GRID_COLUMNS);
  const maxH = widget.maxSize?.h ?? Infinity;
  const w = clamp(item.w, Math.min(widget.minSize.w, maxW), maxW);

  return {
    ...item,
    w,
    h: clamp(item.h, widget.minSize.h, maxH),
    x: clamp(item.x, 0, DASHBOARD_GRID_COLUMNS - w),
    y: Math.max(0, item.y),
  };
};

/**
 * Vertical compaction (as react-grid-layout's `verticalCompactor` in old
 * core-ui): in reading order every tile floats up as far as it can, and moves
 * down while it overlaps a tile already placed. `priorityId` (the tile being
 * dragged, resized or dropped) wins a tie for its spot, so moving a tile onto
 * another pushes that one down, and moving it past one swaps them.
 */
export const compactLayout = (items: TDashboardItem[], priorityId?: string): TDashboardItem[] => {
  const sorted = [...items].sort(
    (a, b) => byPosition(a, b) || Number(b.id === priorityId) - Number(a.id === priorityId),
  );

  const placed: TDashboardItem[] = [];

  for (const item of sorted) {
    const next = { ...item, y: Math.max(0, item.y) };

    while (next.y > 0 && !placed.some((other) => overlaps({ ...next, y: next.y - 1 }, other))) {
      next.y -= 1;
    }

    while (placed.some((other) => overlaps(next, other))) {
      next.y += 1;
    }

    placed.push(next);
  }

  return placed;
};

/** `items` with one tile moved or resized, then compacted. */
export const placeItem = (items: TDashboardItem[], id: string, rect: Partial<TRect>) =>
  compactLayout(
    items.map((item) => (item.id === id ? { ...item, ...rect } : item)),
    id,
  );

// Keeps the same array when nothing moved, so state updates stay cheap.
export const sameLayout = (a: TDashboardItem[], b: TDashboardItem[]) => {
  if (a.length !== b.length) {
    return false;
  }

  const byId = new Map(b.map((item) => [item.id, item]));

  return a.every((item) => {
    const other = byId.get(item.id);

    return (
      !!other &&
      other.type === item.type &&
      other.x === item.x &&
      other.y === item.y &&
      other.w === item.w &&
      other.h === item.h
    );
  });
};

export const newTileId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
