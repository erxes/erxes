import { Route } from 'react-router';

import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { pluginsConfigState } from 'ui-modules';
import { useAtom } from 'jotai';
import { PermissionRouteGuard } from '@/auth/components/PermissionRouteGuard';

export const getPluginsRoutes = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  // A hosted extension's pages render inside its host's routes.
  const plugins = Object.values(pluginsMetaData || {}).filter(
    (config) => !config.host,
  );

  return plugins.map((module) => (
    <Route
      key={module.name}
      path={`/${module.path}/*`}
      element={
        <PermissionRouteGuard plugin={module.name}>
          <RenderPluginsComponent
            pluginName={`${module.name}_ui`}
            remoteModuleName={module.name}
            withMascot
          />
        </PermissionRouteGuard>
      }
    />
  ));
};
