import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { IUIConfig } from 'erxes-ui';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import { pluginsConfigState, useVersion } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const usePluginsModules = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const { t } = useTranslation('common', { keyPrefix: 'core-modules' });

  const version = useVersion();

  const CORE_MODULES = GET_CORE_MODULES(t, version);

  const modules = useMemo(() => {
    const flattenModules = (moduleList: IUIConfig['modules']) => {
      return (moduleList || []).flatMap((module) => {
        const flattened = [module];
        if (Array.isArray(module.submenus)) {
          flattened.push(...(flattenModules(module.submenus) || []));
        }
        return flattened;
      });
    };

    const pluginsModules = Object.values(pluginsMetaData || {}).flatMap(
      (plugin) =>
        (plugin.modules || []).map((module) => ({
          ...module,
          pluginName: plugin.name,
        })),
    );

    const allModules = [...(CORE_MODULES || []), ...pluginsModules];

    return flattenModules(allModules) as IUIConfig['modules'];
  }, [pluginsMetaData, CORE_MODULES]);

  return modules;
};
