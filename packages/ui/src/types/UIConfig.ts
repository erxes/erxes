import type { Icon } from '@tabler/icons-react';
import type { TContactContentType } from '../modules/records/contacts';
import type { RecordRef } from '../modules/records/openRecord';
import type { UseQueryOptions } from '@tanstack/react-query';

/**
 * A property input's own settings, stored with the custom field.
 * Each input defines its keys.
 */
export type TPropertyInputMeta = Record<string, unknown>;

/**
 * Props of a plugin's activity row component in `widgets.activityRows`.
 * The shape comes from erxes 3.x; web doesn't read `widgets` from a plugin's config.
 */
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

/**
 * Props of a custom property input in `widgets.propertyInputs`.
 * It edits the field's value as text and its own settings as `meta`. The shape comes from
 * erxes 3.x; web doesn't read `widgets` from a plugin's config.
 */
export type TPropertyInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  meta?: TPropertyInputMeta;
  onMetaChange: (meta: TPropertyInputMeta) => void;
  disabled?: boolean;
};

/** The schematic a dashboard widget shows in the widget catalog. */
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

/** What a record section is given: the customer or company it shows on. */
export type TRecordSectionProps = {
  contentType: TContactContentType;
  contentId: string;
};

/**
 * A plugin's section on a customer's or company's detail in core's panel.
 * It sits under core's own sections, e.g. the customer's deals. One that crashes shows its
 * error, not the panel's.
 */
export type TRecordSection = {
  contentType: TContactContentType;
  /** The section's heading. */
  title: string;
  icon: React.ElementType;
  component: React.ComponentType<TRecordSectionProps>;
};

/** What each slot of a plugin record is given: the record. */
export type TRecordSlotProps = RecordRef;

/**
 * The customers and companies a record is about.
 * Its relation tabs list records of these.
 */
export type TRecordContacts = { customerIds: string[]; companyIds: string[] };

/** A plugin record type's own tab, after core's Detail or Activity tab. */
export type TRecordTab = {
  value: string;
  label: string;
  icon: Icon;
  after?: 'detail' | 'activity';
  component: React.ComponentType<TRecordSlotProps>;
};

/**
 * Props of a plugin record type's `New` slot, the draft form.
 * The draft is saved as the record on Save.
 */
export type TRecordDraftProps = {
  /** What its opener passed (`useOpenRecord().openNew(type, defaults)`), e.g. a stage. */
  defaults: Record<string, unknown>;
  /** Call with the saved record's id: the record takes the draft's place in the panel. */
  onCreated: (id: string) => void;
  /** Leaves the draft: back to the record it came from, else closes the panel. */
  onCancel: () => void;
};

/**
 * A record type a plugin shows in core's side panel. Core draws the panel as it draws a
 * customer's: header with Back, expand and close, the tabs (Detail, the type's own `tabs`,
 * every allowed plugin's relation tabs for it, Activity), resizing, the address
 * `?panel=/detail/<contentType>/<id>`, drafts. The plugin fills the slots. Open one with
 * `useOpenRecord().open({ contentType, contentId })`, a draft with `openNew(contentType)`.
 */
export type TPanelRecordType = {
  /** `<plugin name>:<thing>`, e.g. `sales:deal`; it must start with the plugin's `name`. */
  contentType: string;
  /** What one is called, e.g. "Deal": a draft's header reads "New deal". */
  title: string;
  icon: React.ElementType;
  /**
   * The record's own page, where the panel's expand button leads: a route of the plugin's,
   * under its `path`, that renders `<RecordPage contentType contentId />`.
   */
  detailPath: (contentId: string) => string;
  /** The header's title: the record's name, editable in place if the plugin wants. */
  Title: React.ComponentType<TRecordSlotProps>;
  /** The header's own actions (a "more" menu), before expand and close. */
  Actions?: React.ComponentType<TRecordSlotProps>;
  /** The Detail tab: `PanelSection`s of `PanelField` rows. */
  Detail: React.ComponentType<TRecordSlotProps>;
  tabs?: TRecordTab[];
  /** A record not created yet; without it, the type has no drafts. */
  New?: React.ComponentType<TRecordDraftProps>;
  /**
   * The record's customers and companies, as query options (often the record's own query with
   * `select`). Without it, plugins' relation tabs don't show on this type.
   */
  contacts?: (contentId: string) => UseQueryOptions<TRecordContacts, Error, TRecordContacts>;
  /** A timeline type of the plugin's manifest (`timelines`): core's Activity tab shows it. */
  activity?: string;
};

/** Props of a relation tab: the record it shows on, and its contacts. */
export type TRelationTabProps = TRecordSlotProps & TRecordContacts;

/**
 * A plugin's tab on other records' panels, listing its own records.
 * It lists the plugin's own records of the same customers and companies: a customer's deals, a
 * task's deals. Shown on core's customers and companies
 * (their contacts are themselves) and on plugin record types that give `contacts`. A record
 * clicked in it opens on top in the same panel (`useOpenRecord().open`), and Back returns.
 */
export type TRelationTab = {
  /** Unique within the plugin, e.g. `deals`. */
  name: string;
  title: string;
  icon: Icon;
  /** The content types it shows on (`core:customer`, `tasks:task`); every one when omitted. */
  hosts?: string[];
  component: React.ComponentType<TRelationTabProps>;
};

/**
 * A plugin UI's `CONFIG`, exported from its `./config` remote.
 * web reads `name`, `path`, `icon`, `modules`, `checkAccess`, `recordSections`, `recordTypes`
 * and `relationTabs`; its first module renders under `/<path>/*`. The other fields come from
 * erxes 3.x and web ignores them.
 */
export type IUIConfig = {
  name: string;
  path: string;
  icon?: React.ElementType;
  /** Sections on core's customer and company detail, shown to members who may use the plugin. */
  recordSections?: TRecordSection[];
  /** The plugin's records core's side panel opens, for members who may use the plugin. */
  recordTypes?: TPanelRecordType[];
  /** Tabs on other records' panels listing the plugin's records of their contacts. */
  relationTabs?: TRelationTab[];
  i18n?: boolean;
  i18nNamespace?: string;
  hasFloatingWidget?: boolean;
  /**
   * erxes platform versions this plugin is built for, as a semver range
   * (e.g. `'~3.2'`, `'>=3.2.25 <3.4'`). Core warns, and still loads the
   * plugin, when the running platform is outside the range.
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
