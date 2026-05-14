import { useAtom } from 'jotai';
import { pluginsConfigState } from 'ui-modules/states';

export const useSegmentConfigWidget = (contentType: string) => {
  const [pluginName, moduleName] = contentType.split(':');

  const [pluginsMetaData] = useAtom(pluginsConfigState);

  if (!pluginsMetaData) {
    return {
      hasSegmentConfigWidget: false,
    };
  }

  const plugins = Object.values(pluginsMetaData);

  const hasSegmentConfigWidget = plugins.some(
    (plugin) =>
      plugin.name === pluginName &&
      plugin.modules.some(
        (module) =>
          [moduleName, `${moduleName}s`].includes(module.name) &&
          module.hasSegmentConfigWidget,
      ),
  );
  return {
    hasSegmentConfigWidget,
  };
};
