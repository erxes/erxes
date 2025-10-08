import { useAtom } from 'jotai';
import { pluginsConfigState } from 'ui-modules';

export const useFloatingWidgetsModules = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);

  if (!pluginsMetaData) {
    return [];
  }

  const plugins = Object.values(pluginsMetaData);

  return plugins.flatMap((plugin) =>
    (plugin.modules || [])
      .filter((module) => module.hasFloatingWidget)
      .map((module) => ({
        ...module,
        pluginName: plugin.name,
      })),
  );
};
