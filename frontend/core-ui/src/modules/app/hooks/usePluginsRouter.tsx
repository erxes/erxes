import { Route } from 'react-router';

import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { pluginsConfigState } from 'ui-modules';
import { useAtom } from 'jotai';
import { PermissionRouteGuard } from '@/auth/components/PermissionRouteGuard';

export const getPluginsRoutes = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const plugins = Object.entries(pluginsMetaData || {});

  return plugins.map(([remoteName, module]) => (
    <Route
      key={remoteName}
      path={`/${module.path}/*`}
      element={
        <PermissionRouteGuard plugin={module.name}>
          <RenderPluginsComponent
            pluginName={remoteName}
            remoteModuleName={module.name}
            withMascot
          />
        </PermissionRouteGuard>
      }
    />
  ));
};
