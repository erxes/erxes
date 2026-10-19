import { PermissionRouteGuard } from '@/auth/components/PermissionRouteGuard';
import { AppLayoutExtensionsProvider, type IUIConfig } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

const ownsPath = (config: IUIConfig, pathname: string) =>
  pathname === `/${config.path}` || pathname.startsWith(`/${config.path}/`);

// Puts each extension with a `host` into that app's AppLayout: its modules in
// the sidebar, its page in place of the app's own routes.
export const HostedExtensionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const plugins = useAtomValue(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();

  const value = useMemo(() => {
    const hosted = (layoutId: string) =>
      Object.values(plugins ?? {}).filter((config) => config.host === layoutId);

    return {
      links: (layoutId: string) =>
        hosted(layoutId)
          .filter(
            (config) =>
              !isLoaded || isWildcard || hasPluginPermission(config.name),
          )
          .flatMap((config) => config.modules ?? []),
      page: (layoutId: string, pathname: string) => {
        const config = hosted(layoutId).find((c) => ownsPath(c, pathname));

        return config ? (
          <PermissionRouteGuard plugin={config.name}>
            <RenderPluginsComponent
              pluginName={`${config.name}_ui`}
              remoteModuleName={config.name}
            />
          </PermissionRouteGuard>
        ) : null;
      },
    };
  }, [plugins, isLoaded, isWildcard, hasPluginPermission]);

  return (
    <AppLayoutExtensionsProvider value={value}>
      {children}
    </AppLayoutExtensionsProvider>
  );
};
