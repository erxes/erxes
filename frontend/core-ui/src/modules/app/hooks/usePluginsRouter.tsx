import { Route } from 'react-router';

import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { pluginsConfigState } from 'ui-modules';
import { useAtom } from 'jotai';

export const getPluginsRoutes = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const plugins = Object.values(pluginsMetaData || {});

  const allModules = plugins.flatMap((plugin) =>
    (plugin.modules || [])
      .filter((module) => !module.settingsOnly)
      .map((module) => ({
        ...module,
        pluginName: plugin.name,
      })),
  );

  return allModules.map((module) => (
    <Route
      key={module.name}
      path={`/${module.path}/*`}
      element={
        <RenderPluginsComponent
          moduleName={module.name}
          pluginName={`${module.pluginName}_ui`}
          remoteModuleName={module.name}
        />
      }
    />
  ));
};

export const getPluginsSettingsRoutes = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const plugins = Object.values(pluginsMetaData || {});

  const settingsModules = plugins.flatMap((plugin) =>
    (plugin.modules || [])
      .filter((module) => module.hasSettings || module.settingsOnly)
      .map((module) => ({
        ...module,
        pluginName: plugin.name,
      })),
  );

  return settingsModules.map((module) => (
    <Route
      key={module.name}
      path={`/${module.path}/*`}
      element={
        <RenderPluginsComponent
          moduleName={module.name}
          pluginName={`${module.pluginName}_ui`}
          remoteModuleName={`${module.name}Settings`}
        />
      }
    />
  ));
};
