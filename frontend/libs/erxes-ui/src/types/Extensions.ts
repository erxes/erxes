import type { Icon } from '@tabler/icons-react';
import type { ComponentType } from 'react';

/**
 * Records an extension can add side tabs, actions and list columns to. Each
 * one has a list (`RecordTable` with a known `tableId`) and opens in the
 * record side panel.
 */
export const RECORD_CONTENT_TYPES = [
  'core:customer',
  'core:company',
  'core:user',
  'sales:deal',
  'frontline:ticket',
] as const;

export type RecordContentType = (typeof RECORD_CONTENT_TYPES)[number];

/** What a side tab or list cell component is given. */
export type IRecordPlacementProps = {
  contentType: string;
  contentId: string;
};

/**
 * An extension's `./config` `CONFIG`. Every `component` below is what the
 * host renders there, in Suspense and an error boundary: the SDK's
 * `extensionComponent(() => import(...))`. An extension lives inside one
 * plugin (`host`) and never shows as a plugin of its own.
 */
export type IExtensionUIConfig = {
  /** The extension id, as installed, e.g. `'deal-insights'`. */
  id: string;
  label: string;
  icon?: Icon;
  /** The plugin it lives in, e.g. `'sales'`, or `'core'` for core records. */
  host: string;
  /**
   * Pages in the host's sidebar "Extensions" group, at `/<host>/<path>`.
   * Needs a plugin host: core has no app sidebar for them.
   */
  pages?: {
    label: string;
    path: string;
    icon?: Icon;
    component: ComponentType;
  }[];
  /**
   * Tabs in these records' side panel. The tab gets
   * `{ contentType, contentId }` as props, and from `useRecordContext()`.
   */
  sideTabs?: {
    /** Unique in the extension: the tab's value. */
    name: string;
    label: string;
    icon: Icon;
    contentTypes: RecordContentType[];
    component: ComponentType<IRecordPlacementProps>;
  }[];
  /**
   * Actions on a record type: in the side panel's header for the open record,
   * and in its list's bulk bar for the selected rows. They read the
   * records through `useRecordSelection()` (ui-modules).
   */
  recordActions?: { [K in RecordContentType]?: ComponentType };
  /**
   * Columns appended to a record type's list. The cell gets
   * `{ contentType, contentId }` as props.
   */
  recordColumns?: {
    [K in RecordContentType]?: {
      /** Unique in the extension: the column's id. */
      name: string;
      label: string;
      component: ComponentType<IRecordPlacementProps>;
    }[];
  };
  /**
   * Buttons in message composers. Each opens its `component` in a popover,
   * given `IComposerActionProps`.
   */
  composerActions?: {
    id: string;
    label: string;
    icon: Icon;
    component: ComponentType<IComposerActionProps>;
  }[];
};

/** What a composer action's component is given. */
export type IComposerActionProps = {
  /** Inserts the text into the composer and closes the action. */
  insertText: (text: string) => void;
  /** The record the message is written on, e.g. `frontline:conversation`. */
  contentType: string;
  contentId: string;
  isInternalNote: boolean;
};
