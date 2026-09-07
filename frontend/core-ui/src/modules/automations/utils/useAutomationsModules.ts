import { pluginsConfigState } from 'ui-modules';
import { useAtom } from 'jotai';

export const useAutomationsRemoteModules = (pluginName: string) => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);

  if (!pluginsMetaData) {
    return { isEnabled: false };
  }

  const plugins = Object.values(pluginsMetaData);

  const normalizedName = pluginName.replaceAll('-', '_');

  const result = plugins
    .filter(({ name }) => name === normalizedName)
    .flatMap((plugin) =>
      (plugin.modules || [])
        .filter((module) => module.hasAutomation)
        .map((module) => ({
          ...module,
          pluginName: plugin.name,
        })),
    );
  return { isEnabled: !!result?.length };
};
