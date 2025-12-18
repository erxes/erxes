import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { IUIConfig } from 'erxes-ui';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import { pluginsConfigState, useVersion } from 'ui-modules';

export const usePluginsModules = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);

  const version = useVersion();

  const CORE_MODULES = GET_CORE_MODULES(version);

  const modules = useMemo(() => {
    if (pluginsMetaData) {
      const pluginsModules = Object.values(pluginsMetaData || {}).flatMap(
        (plugin) =>
          (plugin.modules || []).map((module) => ({
            ...module,
            pluginName: plugin.name,
          })),
      );

      return [...CORE_MODULES, ...pluginsModules] as IUIConfig['modules'];
    }
    return CORE_MODULES;
  }, [pluginsMetaData]);

  return modules;
};
