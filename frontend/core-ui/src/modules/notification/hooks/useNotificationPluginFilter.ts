import type { UseNotificationPluginFilterResult } from '@/notification/types/notificationFilters';
import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { loadingPluginsConfigState, pluginsConfigState } from 'ui-modules';

export const useNotificationPluginFilter =
  (): UseNotificationPluginFilterResult => {
    const [selectedPlugin, setPlugin] =
      useQueryState<string>('notificationPlugin');
    const plugins = useAtomValue(pluginsConfigState);
    const loading = useAtomValue(loadingPluginsConfigState);
    const pluginNames = [
      ...new Set([
        'core',
        ...Object.values(plugins || {}).map(({ name }) => name),
      ]),
    ].sort((left, right) => left.localeCompare(right));

    return {
      selectedPlugin,
      pluginNames,
      loading,
      selectPlugin: (name) => setPlugin(selectedPlugin === name ? null : name),
    };
  };
