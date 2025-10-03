import { pluginsConfigState } from 'ui-modules';
import { useAtom } from 'jotai';

export const useWidgetsModules = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);

  if (!pluginsMetaData) {
    return [];
  }

  const plugins = Object.values(pluginsMetaData);

  return plugins.flatMap((plugin) =>
    (plugin.modules || [])
      .filter((module) => module.hasRelationWidget)
      .map((module) => ({
        ...module,
        pluginName: plugin.name,
      })),
  );
};
