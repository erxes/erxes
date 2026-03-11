import { Route } from 'react-router';

import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { pluginsConfigState, useCurrentUserPermissions } from 'ui-modules';
import { useAtom } from 'jotai';
import { AccessDenied } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const PluginRouteGuard = ({
  pluginName,
  children,
}: {
  pluginName: string;
  children: React.ReactNode;
}) => {
  const { can, permissions } = useCurrentUserPermissions();

  const { pathname } = useLocation();

  const knownModules = useMemo(() => {
    const modules = new Set<string>();
    for (const p of permissions) {
      modules.add(p.module);
      modules.add(p.module + 's');
    }
    return modules;
  }, [permissions]);

  const prefix = `/${pluginName}/`;

  if (pathname.startsWith(prefix)) {
    const segments = pathname.slice(prefix.length).split('/').filter(Boolean);

    for (const segment of segments) {
      if (knownModules.has(segment) && !can(segment)) {
        return <AccessDenied module={segment} />;
      }
    }
  }

  return children as React.ReactElement;
};

export const getPluginsRoutes = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const plugins = Object.values(pluginsMetaData || {});

  return plugins.map((module) => (
    <Route
      key={module.name}
      path={`/${module.path}/*`}
      element={
        <PluginRouteGuard pluginName={module.name}>
          <RenderPluginsComponent
            pluginName={`${module.name}_ui`}
            remoteModuleName={module.name}
          />
        </PluginRouteGuard>
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
        <RenderPluginsComponent
          pluginName={`${plugin.name}_ui`}
          remoteModuleName={`${plugin.name}Settings`}
        />
      }
    />
  ));
};
