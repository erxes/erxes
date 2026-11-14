import { useAtom } from 'jotai';
import type { IRelationWidgetTab } from 'ui-modules/modules/widget/record-side-panel/useRelationWidgetTabs';
import {
  buildRecordOverviewEntries,
  type IRecordOverviewSection,
  type TRecordOverviewEntry,
} from 'ui-modules/modules/widget/record-side-panel/overview/recordOverviewEntries';
import {
  recordOverviewLayoutState,
  type IRecordOverviewLayout,
} from 'ui-modules/modules/widget/record-side-panel/overview/recordOverviewState';

export interface IRecordOverview {
  contentType: string;
  allEntries: TRecordOverviewEntry[];
  pinned: TRecordOverviewEntry[];
  overviewEntries: TRecordOverviewEntry[];
  layout: IRecordOverviewLayout;
  onReorder: (order: string[]) => void;
  onToggleTab: (key: string) => void;
}

const EMPTY_LAYOUT: IRecordOverviewLayout = { order: [], tabs: [] };

export const useRecordOverview = ({
  contentType,
  sections = [],
  tabs,
}: {
  contentType: string;
  sections?: IRecordOverviewSection[];
  tabs: IRelationWidgetTab[];
}): IRecordOverview => {
  const [layouts, setLayouts] = useAtom(recordOverviewLayoutState);
  const layout = layouts[contentType] || EMPTY_LAYOUT;
  const allEntries = buildRecordOverviewEntries(sections, tabs, layout.order);

  const saveLayout = (next: Partial<IRecordOverviewLayout>) =>
    setLayouts((previous) => ({
      ...previous,
      [contentType]: { ...(previous[contentType] || EMPTY_LAYOUT), ...next },
    }));

  return {
    contentType,
    allEntries,
    layout,
    pinned: allEntries.filter((entry) => layout.tabs.includes(entry.key)),
    overviewEntries: allEntries.filter(
      (entry) => !layout.tabs.includes(entry.key),
    ),
    onReorder: (order) => saveLayout({ order }),
    onToggleTab: (key) =>
      setLayouts((previous) => {
        const current = previous[contentType] || EMPTY_LAYOUT;

        return {
          ...previous,
          [contentType]: {
            ...current,
            tabs: current.tabs.includes(key)
              ? current.tabs.filter((pinnedKey) => pinnedKey !== key)
              : [...current.tabs, key],
          },
        };
      }),
  };
};
