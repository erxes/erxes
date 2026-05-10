export type ElementKind = 'atom' | 'molecule' | 'organism';

export type GridLayoutCell = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type BuilderNode = {
  id: string;
  type: string;
  kind: ElementKind;
  props: Record<string, unknown>;
  children?: BuilderNode[];
  layout?: GridLayoutCell;
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
  updatedAt: string;
  createdAt: string;
};

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type DragSource =
  | { kind: 'palette'; type: string }
  | { kind: 'node'; id: string };
