export const SLOT_CANVAS = { WIDTH: 1000, HEIGHT: 1000 } as const;

export const SLOT_CANVAS_EXTENT: [[number, number], [number, number]] = [
  [0, 0],
  [SLOT_CANVAS.WIDTH, SLOT_CANVAS.HEIGHT],
];

export const SLOT_DEFAULT_SIZE = { WIDTH: 80, HEIGHT: 80 } as const;

export const SLOT_MIN_SIZE = 40;

export const SLOT_SNAP_GRID: [number, number] = [20, 20];

export const SLOT_DEFAULT_COLOR = '#4F46E5';

export const SLOT_GRID_LAYOUT = {
  COLUMNS: 5,
  GAP: 40,
  START: 40,
} as const;
