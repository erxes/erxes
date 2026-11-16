import type { Icon } from '@tabler/icons-react';
import type { TContactContentType } from '../modules/records/contacts';
import type { RecordRef } from '../modules/records/openRecord';
import type { UseQueryOptions } from '@tanstack/react-query';

/** Every schematic the widget catalog can draw for a dashboard widget. */
export const DASHBOARD_WIDGET_PREVIEWS = [
  'bar',
  'line',
  'area',
  'pie',
  'table',
  'list',
  'kpi',
  'heatmap',
  'progress',
] as const;

/** The schematic a dashboard widget shows in the widget catalog. */
export type TDashboardWidgetPreview = (typeof DASHBOARD_WIDGET_PREVIEWS)[number];

/**
 * A plugin's tile for core's home dashboard.
 * It shows in the widget catalog, under the plugin's name, to members who may use the plugin.
 * A member places it at most once.
 */
export type TDashboardWidget = {
  /** Unique within the plugin, e.g. `open-tickets`: a saved tile names it. */
  name: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  /** The schematic the catalog draws; the icon when left out. */
  preview?: TDashboardWidgetPreview;
  /** Grid units on a 12-column grid when placed; 6 × 6 when left out. */
  size?: { w: number; h: number };
  /**
   * The tile's body, under core's header with the title; it scrolls when taller than the tile.
   * A `lazy` one loads when the tile first shows.
   */
  component: React.ComponentType;
};

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
 * A custom field's value: text, number, date, yes/no or options.
 * A date is `YYYY-MM-DD`; several options are a list.
 */
export type TPropertyValue = string | number | boolean | string[];

/**
 * Custom fields on a plugin record type, whose values the plugin keeps.
 * Core keeps the fields of `type` (Settings › Properties, under the plugin) and draws the
 * record's Properties tab; the plugin keeps each record's values by field id, checks a patch
 * with core's `fields.check` and saves the values it answers.
 */
export type TRecordProperties = {
  /** The record type the fields are defined on, `<plugin>.<type>`, e.g. `operation.task`. */
  type: string;
  /** The record's values by field id, as query options; core refetches them after a save. */
  values: (contentId: string) => UseQueryOptions<Record<string, TPropertyValue>>;
  /** Saves a patch of values by field id; `null` clears one. */
  save: (contentId: string, patch: Record<string, TPropertyValue | null>) => Promise<unknown>;
  /**
   * What a field group can be limited to, as old sales' groups were to boards and pipelines
   * (`team`, `project`): the group shows only on records in one of the picked ids of each.
   * The plugin passes a record's `appliesTo` to `fields.check`, which refuses the rest.
   */
  limits?: TPropertyLimit[];
  /** What a record is in, by the limits' keys (`{ team: [id] }`); needed with `limits`. */
  appliesTo?: (contentId: string) => UseQueryOptions<Record<string, string[]>>;
};

/** One thing a plugin's field groups can be limited to. */
export type TPropertyLimit = {
  /** The key in the group's `appliesTo`: lower case letters, digits and `_`. */
  key: string;
  /** What it lists, in the plugin's words ("Teams"). */
  label: string;
  /** The choices, as query options. */
  options: UseQueryOptions<{ value: string; label: string }[]>;
};

/**
 * A record type a plugin shows in core's side panel. Core draws the panel as it draws a
 * customer's: header with Back, expand and close, the tabs (Detail, the type's own `tabs`,
 * Properties, every allowed plugin's relation tabs for it, Activity), resizing, the address
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
  /** Custom fields: core adds a Properties tab and a settings page for them. */
  properties?: TRecordProperties;
};

/** Props of a relation tab: the record it shows on, and its contacts. */
export type TRelationTabProps = TRecordSlotProps & TRecordContacts;

/**
 * A plugin's tab on other records' panels, listing its own records.
 * It lists the plugin's own records of the same customers and companies: a customer's deals.
 * Shown on core's customers and companies (their contacts are themselves), and on the plugin
 * record types `hosts` names that give `contacts` (a task's deals). A record clicked in it opens
 * on top in the same panel (`useOpenRecord().open`), and Back returns.
 */
export type TRelationTab = {
  /** Unique within the plugin, e.g. `deals`. */
  name: string;
  title: string;
  icon: Icon;
  /** Plugin record types it also shows on (`tasks:task`); customers and companies always. */
  hosts?: string[];
  component: React.ComponentType<TRelationTabProps>;
};

/**
 * A plugin's settings page, linked from core's settings sidebar.
 * The page is a route of the plugin's own, under its `path`, e.g. `/frontline/settings/tags`.
 */
export type TPluginSettingsPage = {
  /** The page's address, under the plugin's `path`. */
  path: string;
  label: string;
  icon?: React.ElementType;
};

/**
 * A plugin UI's `CONFIG`, exported from its `./config` remote.
 * web reads `name`, `path`, `icon`, `modules`, `checkAccess`, `recordSections`, `recordTypes`,
 * `relationTabs`, `settings`, `dashboardWidgets` and `floatingWidget`; its first module renders
 * under `/<path>/*`. The other fields come from erxes 3.x and web ignores them.
 */
export type IUIConfig = {
  name: string;
  path: string;
  icon?: React.ElementType;
  /** The plugin's settings pages, in core's settings sidebar for members who may use the plugin. */
  settings?: TPluginSettingsPage[];
  /** Sections on core's customer and company detail, shown to members who may use the plugin. */
  recordSections?: TRecordSection[];
  /** The plugin's records core's side panel opens, for members who may use the plugin. */
  recordTypes?: TPanelRecordType[];
  /** Tabs on other records' panels listing the plugin's records of their contacts. */
  relationTabs?: TRelationTab[];
  /** Tiles in core's home dashboard catalog, for members who may use the plugin. */
  dashboardWidgets?: TDashboardWidget[];
  /**
   * One component web mounts once beside the app shell, on every page, for members who may use
   * the plugin, and keeps mounted across navigation (a softphone). It sits in the bottom-right
   * corner above the page.
   */
  floatingWidget?: React.ComponentType;
  i18n?: boolean;
  i18nNamespace?: string;
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
  modules?: {
    name: string;
    icon?: React.ElementType;
    path: string;
    hasAutomation?: boolean;
    hasRelationWidget?: boolean;
    hasSegmentConfigWidget?: boolean;
  }[];
};
