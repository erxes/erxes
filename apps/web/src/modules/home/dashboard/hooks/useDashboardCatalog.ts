import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePluginText } from '~/modules/plugins/pluginText';
import { HOME_NS } from '../../i18n';
import { useDashboard } from '../context/DashboardProvider';
import type { TDashboardWidgetDefinition } from '../types/dashboardTypes';
import { useDashboardWidgetText } from './useDashboardWidgetText';

// Catalog group names: [namespace, key].
const GROUP_KEYS: Record<string, [string, string]> = {
  home: ['common', 'home.dashboard.group-home'],
  contacts: [HOME_NS, 'group-contacts'],
  reports: [HOME_NS, 'group-reports'],
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
  const pluginText = usePluginText();
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

      const entries = byGroup.get(widget.group) ?? [];
      entries.push({
        widget,
        label,
        description,
        isPlaced: !!widget.singleton && placedTypes.has(widget.type),
      });
      byGroup.set(widget.group, entries);
    }

    const groupLabel = (group: string, plugin?: string) => {
      if (plugin) return pluginText(plugin, capitalize(plugin));

      const key = GROUP_KEYS[group];

      return key ? t(key[1], { ns: key[0] }) : capitalize(group);
    };

    return [...byGroup.entries()].map(([group, entries]) => ({
      group,
      label: groupLabel(group, entries[0]?.widget.plugin),
      entries,
    }));
  }, [widgets.available, items, search, getText, pluginText, t]);

  return { search, setSearch, groups };
};
