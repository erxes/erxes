import { TDashboardWidgetDefinition } from '@/home/dashboard/types/dashboardTypes';
import { DASHBOARD_WIDGETS } from '@/home/dashboard/widgets/dashboardWidgets';
import { toPluginDashboardWidget } from '@/home/dashboard/widgets/pluginDashboardWidgets';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';

const isGridSize = (size?: { w?: unknown; h?: unknown }) =>
  !!size && Number.isInteger(size.w) && Number.isInteger(size.h);

/** Core and plugin widgets this user may place, and a lookup by type. */
export const useDashboardWidgets = () => {
  const plugins = useAtomValue(pluginsConfigState);
  const { isLoaded, isWildcard, hasModulePermission, hasPluginPermission } =
    usePermissionCheck();

  return useMemo(() => {
    const allowed = (check: () => boolean) =>
      !isLoaded || isWildcard || check();

    const coreWidgets = DASHBOARD_WIDGETS.filter(
      ({ modulePath }) =>
        !modulePath || allowed(() => hasModulePermission(modulePath)),
    );

    // A malformed entry is skipped rather than breaking the whole grid
    const pluginWidgets = Object.values(plugins || {}).flatMap((plugin) =>
      allowed(() => hasPluginPermission(plugin.name))
        ? (plugin.widgets?.dashboardWidgets || [])
            .filter(
              (widget) =>
                !!widget.name &&
                !!widget.label &&
                isGridSize(widget.defaultSize),
            )
            .map((widget) => toPluginDashboardWidget(plugin.name, widget))
        : [],
    );

    const available = [...coreWidgets, ...pluginWidgets];

    return {
      available,
      byType: new Map<string, TDashboardWidgetDefinition>(
        available.map((widget) => [widget.type, widget]),
      ),
    };
  }, [plugins, isLoaded, isWildcard, hasModulePermission, hasPluginPermission]);
};
