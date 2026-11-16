import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePluginText } from '~/modules/plugins/pluginText';
import type { TDashboardWidgetDefinition } from '../types/dashboardTypes';

/** A widget's name and description in its own namespace, or a plugin's in the plugin's words. */
export const useDashboardWidgetText = () => {
  const { t } = useTranslation();
  const pluginText = usePluginText();

  return useCallback(
    ({ plugin, ns, labelKey, descriptionKey }: TDashboardWidgetDefinition) => {
      const text = (key: string) =>
        plugin ? pluginText(plugin, key) : t(key, { ns, defaultValue: key });

      return { label: text(labelKey), description: descriptionKey ? text(descriptionKey) : '' };
    },
    [t, pluginText],
  );
};
