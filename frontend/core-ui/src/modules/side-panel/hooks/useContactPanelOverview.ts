import { useAtom } from 'jotai';
import { useState } from 'react';
import type { IRelationWidgetTab } from 'ui-modules';
import { useContactWidgetModules } from '@/side-panel/hooks/useContactWidgetModules';
import {
  buildContactOverviewEntries,
  type TContactOverviewEntry,
} from '@/side-panel/components/relations/contactOverviewEntries';
import {
  contactOverviewLayoutState,
  type IContactOverviewLayout,
} from '@/side-panel/states/contactOverviewState';

export interface IContactPanelOverview {
  contactType: 'core:customer' | 'core:company' | null;
  allEntries: TContactOverviewEntry[];
  pinned: TContactOverviewEntry[];
  overviewEntries: TContactOverviewEntry[];
  moreTabs: IRelationWidgetTab[];
  layout: IContactOverviewLayout;
  onUnavailable: (key: string) => void;
  onReorder: (order: string[]) => void;
  onToggleTab: (key: string) => void;
}

/** Applies stored contact layout choices and falls back to relation widgets after a section fails. */
export const useContactPanelOverview = (
  contentType: string,
  relationTabs: IRelationWidgetTab[],
): IContactPanelOverview => {
  const contactType =
    contentType === 'core:customer' || contentType === 'core:company'
      ? contentType
      : null;
  const modules = useContactWidgetModules();
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [layouts, setLayouts] = useAtom(contactOverviewLayoutState);
  const overviewModules = contactType
    ? modules.filter(
        (module) =>
          !unavailable.includes(`${module.pluginName}.${module.name}`),
      )
    : [];
  const overviewKeys = new Set(
    overviewModules.map((module) => `${module.pluginName}.${module.name}`),
  );
  const moreTabs = relationTabs.filter((tab) => !overviewKeys.has(tab.value));
  const layout = (contactType && layouts[contactType]) || {
    order: [],
    tabs: [],
  };
  const allEntries = contactType
    ? buildContactOverviewEntries(overviewModules, moreTabs, layout.order)
    : [];
  /** Persists layout choices only for a supported contact type. */
  const saveLayout = (next: Partial<IContactOverviewLayout>) => {
    if (!contactType) return;
    setLayouts((previous) => ({
      ...previous,
      [contactType]: { ...layout, ...next },
    }));
  };
  return {
    contactType,
    allEntries,
    moreTabs,
    layout,
    pinned: allEntries.filter((entry) => layout.tabs.includes(entry.key)),
    overviewEntries: allEntries.filter(
      (entry) => !layout.tabs.includes(entry.key),
    ),
    onUnavailable: (key) =>
      setUnavailable((previous) =>
        previous.includes(key) ? previous : [...previous, key],
      ),
    onReorder: (order) => saveLayout({ order }),
    onToggleTab: (key) =>
      saveLayout({
        tabs: layout.tabs.includes(key)
          ? layout.tabs.filter((pinnedKey) => pinnedKey !== key)
          : [...layout.tabs, key],
      }),
  };
};
