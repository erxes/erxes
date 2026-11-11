import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HOME_NS } from '../../i18n';
import { useDashboard } from '../context/DashboardProvider';
import type { TDashboardWidgetDefinition } from '../types/dashboardTypes';
import { useDashboardWidgetText } from './useDashboardWidgetText';

// Catalog group names: [namespace, key].
const GROUP_KEYS: Record<string, [string, string]> = {
  home: ['common', 'home.dashboard.group-home'],
  contacts: [HOME_NS, 'group-contacts'],
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export type TDashboardCatalogEntry = {
  widget: TDashboardWidgetDefinition;
  label: string;
  description: string;
  isPlaced: boolean;
};

/** The catalog grouped by area and narrowed by the search text. */
export const useDashboardCatalog = () => {
  const { t } = useTranslation();
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

    return [...byGroup.entries()].map(([group, entries]) => {
      const key = GROUP_KEYS[group];

      return {
        group,
        label: key ? t(key[1], { ns: key[0] }) : capitalize(group),
        entries,
      };
    });
  }, [widgets.available, items, search, getText, t]);

  return { search, setSearch, groups };
};
