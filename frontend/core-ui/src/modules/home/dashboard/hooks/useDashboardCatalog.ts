import { useDashboard } from '@/home/dashboard/context/DashboardProvider';
import { useDashboardWidgetText } from '@/home/dashboard/hooks/useDashboardWidgetText';
import { TDashboardWidgetDefinition } from '@/home/dashboard/types/dashboardTypes';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Core areas have their own names; a plugin group is the plugin's name.
const CORE_GROUP_KEYS: Record<string, string> = {
  home: 'home.dashboard.group-home',
  automations: 'home.dashboard.group-automations',
};

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export type TDashboardCatalogEntry = {
  widget: TDashboardWidgetDefinition;
  label: string;
  description: string;
  isPlaced: boolean;
};

/** The catalog grouped by source and narrowed by the search text. */
export const useDashboardCatalog = () => {
  const { t } = useTranslation('common');
  const { widgets, items } = useDashboard();
  const getText = useDashboardWidgetText();
  const [search, setSearch] = useState('');

  const groups = useMemo(() => {
    const placedTypes = new Set(items.map(({ type }) => type));
    const query = search.trim().toLowerCase();
    const byGroup = new Map<string, TDashboardCatalogEntry[]>();

    for (const widget of widgets.available) {
      const { label, description } = getText(widget);

      if (query && !`${label} ${description}`.toLowerCase().includes(query)) {
        continue;
      }

      const entries = byGroup.get(widget.group) || [];
      entries.push({
        widget,
        label,
        description,
        isPlaced: !!widget.singleton && placedTypes.has(widget.type),
      });
      byGroup.set(widget.group, entries);
    }

    return [...byGroup.entries()].map(([group, entries]) => ({
      group,
      label: CORE_GROUP_KEYS[group]
        ? t(CORE_GROUP_KEYS[group])
        : t(group, { ns: group, defaultValue: capitalize(group) }),
      entries,
    }));
  }, [widgets.available, items, search, getText, t]);

  return { search, setSearch, groups };
};
