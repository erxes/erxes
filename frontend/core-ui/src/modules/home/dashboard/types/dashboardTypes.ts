import { ComponentType, ElementType } from 'react';
import { TDashboardWidgetPreview } from 'erxes-ui';
import { TDashboardWidgetConfig } from 'ui-modules';

export type { TDashboardWidgetConfig };

export type TDashboardGridSize = { w: number; h: number };

// One tile as stored; x/y/w/h are grid units, not pixels.
export type TDashboardItem = {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config?: TDashboardWidgetConfig | null;
};

export type TDashboardWidgetProps = {
  config?: TDashboardWidgetConfig | null;
};

export type TDashboardWidgetConfigFormProps = {
  config?: TDashboardWidgetConfig | null;
  onSubmit: (config: TDashboardWidgetConfig) => void;
  onCancel: () => void;
};

export type TDashboardWidgetDefinition = {
  type: string;
  // Translation keys in `ns`; a plugin's widget uses the plugin's namespace.
  ns: string;
  labelKey: string;
  descriptionKey?: string;
  icon: ElementType;
  // Core module the user needs access to (as in `hasModulePermission`).
  modulePath?: string;
  // Plugin that draws it through its `./dashboardWidget` remote.
  pluginName?: string;
  defaultSize: TDashboardGridSize;
  minSize: TDashboardGridSize;
  maxSize?: TDashboardGridSize;
  // At most one tile of this widget, e.g. the notifications feed.
  singleton?: boolean;
  preview?: TDashboardWidgetPreview;
  // Catalog group: the plugin's name, or a core area such as `automations`.
  group: string;
  Component: ComponentType<TDashboardWidgetProps>;
  // Widgets with a form are configured before they land on the grid.
  ConfigForm?: ComponentType<TDashboardWidgetConfigFormProps>;
};
