export type ElementKind = 'atom' | 'molecule' | 'organism';

export type GridLayoutCell = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Frame = {
  x: number;
  y: number;
  /** Optional. When omitted the node auto-sizes to content. */
  w?: number;
  h?: number;
  rotation?: number;
};

export type NodeStyle = {
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
};

export type BuilderNode = {
  id: string;
  type: string;
  kind: ElementKind;
  props: Record<string, unknown>;
  children?: BuilderNode[];
  /** @deprecated 12-col grid coords. Use `frame` for absolute positioning. */
  layout?: GridLayoutCell;
  frame?: Frame;
  style?: NodeStyle;
  zIndex?: number;
  locked?: boolean;
  hidden?: boolean;
  name?: string;
};

export type PageTemplate = 'blank' | 'with-header' | 'with-sidebar' | 'landing';

export type PageStatus = 'draft' | 'published';

export type LayoutPage = {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  template: PageTemplate;
  root: BuilderNode;
  background?: string;
  updatedAt: string;
  createdAt: string;
};

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type DragSource =
  | { kind: 'palette'; type: string }
  | { kind: 'node'; id: string };

export const CANVAS_WIDTH: Record<DeviceMode, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
};

export const CANVAS_HEIGHT_MIN = 900;

/** Cell size used to map legacy 12-col grid coords to absolute pixels. */
const LEGACY_COL_WIDTH = 100;
const LEGACY_ROW_HEIGHT = 30;
const LEGACY_GUTTER = 12;

export const legacyCellToFrame = (cell: GridLayoutCell): Frame => ({
  x: cell.x * (LEGACY_COL_WIDTH + LEGACY_GUTTER) + LEGACY_GUTTER,
  y: cell.y * (LEGACY_ROW_HEIGHT + LEGACY_GUTTER) + LEGACY_GUTTER,
  w: cell.w * LEGACY_COL_WIDTH + (cell.w - 1) * LEGACY_GUTTER,
  h: cell.h * LEGACY_ROW_HEIGHT + (cell.h - 1) * LEGACY_GUTTER,
});
