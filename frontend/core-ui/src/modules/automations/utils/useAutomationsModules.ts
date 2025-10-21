import { pluginsConfigState } from 'ui-modules';
import { useAtom } from 'jotai';

export const useAutomationsRemoteModules = (pluginName: string) => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);

  if (!pluginsMetaData) {
    return { isEnabled: false };
  }

  const plugins = Object.values(pluginsMetaData);

  const result = plugins
    .filter(({ name }) => name === pluginName)
    .flatMap((plugin) =>
      (plugin.modules || [])
        // .filter((module) => module.name === moduleName && module.hasAutomation)
        .map((module) => ({
          ...module,
          pluginName: plugin.name,
        })),
    );
  return { isEnabled: !!result?.length };
};
