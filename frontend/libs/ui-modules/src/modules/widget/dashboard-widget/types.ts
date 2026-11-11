export type TDashboardWidgetConfig = Record<string, unknown>;

/**
 * What a plugin's `./dashboardWidget` remote is asked to draw for one module
 * (`module`, as listed in `widgets.dashboardWidgets`): the tile itself, or,
 * for a `configurable` widget, the form that sets its config.
 */
export type IDashboardWidgetProps =
  | {
      mode: 'view';
      module: string;
      config?: TDashboardWidgetConfig | null;
    }
  | {
      mode: 'config';
      module: string;
      config?: TDashboardWidgetConfig | null;
      onConfigSubmit: (config: TDashboardWidgetConfig) => void;
      onConfigCancel: () => void;
    };
