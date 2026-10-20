import { PermissionRouteGuard } from '@/auth/components/PermissionRouteGuard';
import { optionalProvider } from '@/widgets/utils/optionalProvider';
import { AppLayoutExtensionsProvider, type IUIConfig } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

const SafeAppLayoutExtensionsProvider = optionalProvider(
  AppLayoutExtensionsProvider,
);

const ownsPath = (config: IUIConfig, pathname: string) =>
  pathname === `/${config.path}` || pathname.startsWith(`/${config.path}/`);

// Mounts the extension under a route at its own path, relative to the route
// the host's AppLayout sits in, so the extension's relative routes resolve.
const HostedPage = ({ config }: { config: IUIConfig }) => {
  const { pathname } = useLocation();
  const splat = useParams()['*'] ?? '';
  const base = pathname.slice(0, pathname.length - splat.length);
  const path = `/${config.path}`.slice(base.length);

  return (
    <Routes>
      <Route
        path={`${path}/*`}
        element={
          <PermissionRouteGuard plugin={config.name}>
            <RenderPluginsComponent
              pluginName={`${config.name}_ui`}
              remoteModuleName={config.name}
            />
          </PermissionRouteGuard>
        }
      />
    </Routes>
  );
};

// Puts each extension with a `host` into that app's AppLayout: its modules in
// the main sidebar, its page in place of the app's own routes in any of the
// host's layouts (`sales`, `sales:settings`).
export const HostedExtensionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const plugins = useAtomValue(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();

  const value = useMemo(() => {
    const hosted = (host: string) =>
      Object.values(plugins ?? {}).filter((config) => config.host === host);

    return {
      links: (layoutId: string) =>
        hosted(layoutId)
          .filter(
            (config) =>
              !isLoaded || isWildcard || hasPluginPermission(config.name),
          )
          .flatMap((config) => config.modules ?? []),
      page: (layoutId: string, pathname: string) => {
        const config = hosted(layoutId.split(':')[0])
          .filter((c) => ownsPath(c, pathname))
          .sort((a, b) => b.path.length - a.path.length)[0];

        return config ? <HostedPage config={config} /> : null;
      },
    };
  }, [plugins, isLoaded, isWildcard, hasPluginPermission]);

  return (
    <SafeAppLayoutExtensionsProvider value={value}>
      {children}
    </SafeAppLayoutExtensionsProvider>
  );
};
