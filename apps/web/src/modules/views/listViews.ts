import type { TListViews } from 'erxes-ui';
import { lazy } from 'react';

/** Saved views for plugins' lists, loaded when a list with a record type first shows. */
export const LIST_VIEWS: TListViews = {
  Tabs: lazy(async () => ({ default: (await import('./PluginListViews')).PluginViewTabs })),
  Changes: lazy(async () => ({ default: (await import('./PluginListViews')).PluginViewChanges })),
};
