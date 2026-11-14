import type { Icon } from '@tabler/icons-react';
import type { IRelationWidgetTab } from 'ui-modules/modules/widget/record-side-panel/useRelationWidgetTabs';

export interface IRecordOverviewSection {
  pluginName: string;
  name: string;
  label?: string;
  icon?: Icon;
}

export type TRecordOverviewEntry = {
  key: string;
  label: string;
  icon?: Icon;
} & (
  | { kind: 'section'; section: IRecordOverviewSection }
  | { kind: 'widget'; tab: IRelationWidgetTab }
);

export const buildRecordOverviewEntries = (
  sections: IRecordOverviewSection[],
  tabs: IRelationWidgetTab[],
  order: string[],
): TRecordOverviewEntry[] => {
  const entries: TRecordOverviewEntry[] = [
    ...sections.map((section) => ({
      kind: 'section' as const,
      key: `${section.pluginName}.${section.name}`,
      label: section.label || section.name,
      icon: section.icon,
      section,
    })),
    ...tabs.map((tab) => ({
      kind: 'widget' as const,
      key: tab.value,
      label: tab.label,
      icon: tab.icon,
      tab,
    })),
  ];
  const position = (key: string) => {
    const index = order.indexOf(key);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  return entries
    .map((entry, index) => ({ entry, index }))
    .sort(
      (a, b) =>
        position(a.entry.key) - position(b.entry.key) || a.index - b.index,
    )
    .map(({ entry }) => entry);
};
