import type { TDashboardWidgetPreview } from 'erxes-ui';
import type { ComponentType, ElementType } from 'react';

export type TDashboardGridSize = { w: number; h: number };

// One tile as stored; x/y/w/h are grid units, not pixels.
export type TDashboardItem = {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TDashboardWidgetDefinition = {
  type: string;
  // Translation keys in `ns`.
  ns: string;
  labelKey: string;
  descriptionKey?: string;
  icon: ElementType;
  defaultSize: TDashboardGridSize;
  minSize: TDashboardGridSize;
  maxSize?: TDashboardGridSize;
  // At most one tile of this widget.
  singleton?: boolean;
  preview?: TDashboardWidgetPreview;
  // Catalog group, e.g. `home` or `contacts`.
  group: string;
  Component: ComponentType;
};

export type TDashboardTile = {
  item: TDashboardItem;
  widget: TDashboardWidgetDefinition;
};

export type TResizeAxis = 'e' | 's' | 'se';
