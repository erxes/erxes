import { Icon } from '@tabler/icons-react';
import { IRelationWidgetTab } from 'ui-modules';
import { IContactWidgetModule } from '@/side-panel/hooks/useContactWidgetModules';

// One module of a contact overview: a plugin's section, or (for modules
// without one) its relation widget.
export type TContactOverviewEntry = {
  key: string;
  label: string;
  icon?: Icon;
} & (
  | { kind: 'section'; module: IContactWidgetModule }
  | { kind: 'widget'; tab: IRelationWidgetTab }
);

// Sections first, then widgets, each in their own order; then the user's.
export const buildContactOverviewEntries = (
  modules: IContactWidgetModule[],
  tabs: IRelationWidgetTab[],
  order: string[],
): TContactOverviewEntry[] => {
  const entries: TContactOverviewEntry[] = [
    ...modules.map((module) => ({
      kind: 'section' as const,
      key: `${module.pluginName}.${module.name}`,
      label: module.label || module.name,
      icon: module.icon,
      module,
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

  // Stable: modules the user never placed keep their natural order.
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort(
      (a, b) =>
        position(a.entry.key) - position(b.entry.key) || a.index - b.index,
    )
    .map(({ entry }) => entry);
};
