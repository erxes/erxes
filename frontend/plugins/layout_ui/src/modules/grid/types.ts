export type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component: string;
  props?: Record<string, unknown>;
  static?: boolean;
};

export type LayoutConfig = {
  cols?: number;
  rowHeight?: number;
  items: LayoutItem[];
};

export const DEFAULT_COLS = 12;
export const DEFAULT_ROW_HEIGHT = 60;
