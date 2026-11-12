import type { Icon } from '@tabler/icons-react';

/** A property input's own settings, stored with the custom field; each input defines its keys. */
export type TPropertyInputMeta = Record<string, unknown>;

export type TActivityRowProps = {
  activity: {
    _id: string;
    activityType: string;
    sourcePlugin?: string;
    createdAt: string | Date;
    /** The plugin's own payload for the row. */
    metadata?: Record<string, unknown>;
  };
};

export type TPropertyInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  meta?: TPropertyInputMeta;
  onMetaChange: (meta: TPropertyInputMeta) => void;
  disabled?: boolean;
};

export type TDashboardWidgetPreview =
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'table'
  | 'list'
  | 'kpi'
  | 'heatmap'
  | 'progress';

export type IUIConfig = {
  name: string;
  path: string;
  icon?: React.ElementType;
  i18n?: boolean;
  i18nNamespace?: string;
  hasFloatingWidget?: boolean;
  /**
   * erxes platform versions this plugin is built for, as a semver range
   * (e.g. `'~3.2'`, `'>=3.2.25 <3.4'`). Core warns — and still loads the
   * plugin — when the running platform is outside the range.
   */
  platform?: string;
  navigationGroup?: {
    name: string;
    defaultPath?: string;
    icon: React.ElementType;
    /**
     * @deprecated Ignored by core-ui since 3.2.25: a plugin draws its own
     * sidebar by wrapping its routed entry in `AppLayout`. Kept so existing
     * configs still type-check; it will be removed in a later minor release.
     */
    content?: () => React.ReactNode;
    /**
     * @deprecated Ignored by core-ui since 3.2.25; see `content`.
     */
    subGroup?: () => React.ReactNode;
  };

  widgets?: {
    relationWidgets?: {
      name: string;
      icon?: React.ElementType;
      label?: string;
      // Host record types the widget shows on, e.g. `core:customer`;
      // every host when omitted.
      contentTypes?: string[];
    }[];
    // Sections a plugin adds to another plugin's settings page, e.g. what a
    // POS or a pipeline sends to loyalty.
    relationSettingsWidgets?: {
      name: string;
      icon?: React.ElementType;
      label?: string;
    }[];
    // Fields a plugin offers for picking its own records inside another
    // plugin's form, with whatever creating one there takes.
    recordPickerWidgets?: {
      name: string;
      contentType: string;
    }[];
    // Record types the plugin draws in the app's side panel (its
    // `./recordPanel` remote, given `IRecordPanelProps`), e.g.
    // `operation:task`; core keeps the panel's relations and activity.
    recordPanels?: {
      contentType: string;
      // `false` when the type has no custom properties: no Properties tab.
      properties?: boolean;
      draftTitle?: boolean;
      tabs?: {
        value: string;
        label: string;
        labelKey?: string;
        icon?: Icon;
        after?: 'detail' | 'properties' | 'activity';
      }[];
      // The record's own page, built from its URL-encoded id and the page the
      // panel is open on; the panel's expand button leads there. Without one,
      // the panel has no expand button.
      detailPath?: (recordId: string, pathname: string) => string;
    }[];
    // Sections a plugin adds to a customer's or company's overview (its
    // `./contactWidget` remote, given ui-modules' `IContactWidgetProps`):
    // one per module, e.g. `tasks`, listing that contact's records.
    contactWidgets?: {
      name: string;
      label?: string;
      icon?: React.ElementType;
    }[];
    customerDetailWidgets?: {
      name: string;
    }[];
    // Tiles a plugin offers for the home dashboard (its `./dashboardWidget`
    // remote, given ui-modules' `IDashboardWidgetProps`): one per module.
    // Sizes are grid units on a 12-column grid.
    dashboardWidgets?: {
      name: string;
      // Keys in the plugin's translation namespace, shown as is when missing.
      label: string;
      description?: string;
      icon?: React.ElementType;
      defaultSize: { w: number; h: number };
      minSize?: { w: number; h: number };
      maxSize?: { w: number; h: number };
      // Ask for the widget's settings (`mode: 'config'`) before placing it.
      configurable?: boolean;
      // At most one tile of it on a dashboard.
      singleton?: boolean;
      // The schematic core draws for it in the widget catalog.
      preview?: TDashboardWidgetPreview;
    }[];
    formWidgets?: {
      name: string;
      contentType: string;
      icon?: React.ElementType;
    }[];
    propertyInputs?: Record<string, React.ComponentType<TPropertyInputProps>>;
    activityRows?: Record<string, React.ComponentType<TActivityRowProps>>;
  };
  modules?: {
    name: string;
    icon?: React.ElementType;
    path: string;
    hasAutomation?: boolean;
    hasRelationWidget?: boolean;
    hasFloatingWidget?: boolean;
    hasSegmentConfigWidget?: boolean;
  }[];
};
