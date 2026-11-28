import type { TDashboardWidgetPreview } from 'erxes-ui';
import type { ComponentType, ElementType } from 'react';
import { z } from 'zod';

type TDashboardGridSize = { w: number; h: number };

/** One tile as stored; x/y/w/h are grid units, not pixels. */
export const DashboardItem = z.object({
  id: z.string(),
  type: z.string(),
  x: z.int(),
  y: z.int(),
  w: z.int(),
  h: z.int(),
});

export type TDashboardItem = z.infer<typeof DashboardItem>;

export type TDashboardWidgetDefinition = {
  type: string;
  // A plugin's widget: its label and description are the plugin's English text, not keys.
  plugin?: string;
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
