import { Route } from 'react-router';

import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { pluginsConfigState } from 'ui-modules';
import { useAtom } from 'jotai';
import { PermissionRouteGuard } from '@/auth/components/PermissionRouteGuard';

export const getPluginsRoutes = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const plugins = Object.values(pluginsMetaData || {});

  return plugins.map((module) => (
    <Route
      key={module.name}
      path={`/${module.path}/*`}
      element={
        <PermissionRouteGuard plugin={module.name}>
          <RenderPluginsComponent
            pluginName={`${module.name}_ui`}
            remoteModuleName={module.name}
          />
        </PermissionRouteGuard>
      }
    />
  ));
};

export const getPluginsSettingsRoutes = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const plugins = Object.values(pluginsMetaData || {});

  return plugins.map((plugin) => (
    <Route
      key={plugin.name}
      path={`/${plugin.path}/*`}
      element={
        <PermissionRouteGuard plugin={plugin.name}>
          <RenderPluginsComponent
            pluginName={`${plugin.name}_ui`}
            remoteModuleName={`${plugin.name}Settings`}
          />
        </PermissionRouteGuard>
      }
    />
  ));
};
