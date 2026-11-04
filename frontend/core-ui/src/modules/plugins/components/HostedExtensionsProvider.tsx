import { PermissionRouteGuard } from '@/auth/components/PermissionRouteGuard';
import { optionalProvider } from '@/widgets/utils/optionalProvider';
import { AppLayoutExtensionsProvider } from 'erxes-ui';
import { type ComponentType, useMemo } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router';
import { useExtensions } from 'ui-modules';
import { ExtensionBoundary } from '~/plugins/components/ExtensionBoundary';

const SafeAppLayoutExtensionsProvider = optionalProvider(
  AppLayoutExtensionsProvider,
);

type HostedPage = {
  pluginName: string;
  path: string;
  component: ComponentType;
};

const ownsPath = (path: string, pathname: string) =>
  pathname === `/${path}` || pathname.startsWith(`/${path}/`);

// Mounts the page under a route at its own path, relative to the route the
// host's AppLayout sits in, so the extension's relative routes resolve.
const HostedPageRoute = ({ page }: { page: HostedPage }) => {
  const { pathname } = useLocation();
  const splat = useParams()['*'] ?? '';
  const base = pathname.slice(0, pathname.length - splat.length);
  const path = `/${page.path}`.slice(base.length);

  return (
    <Routes>
      <Route
        path={`${path}/*`}
        element={
          <PermissionRouteGuard plugin={page.pluginName}>
            <ExtensionBoundary pluginName={page.pluginName}>
              <page.component />
            </ExtensionBoundary>
          </PermissionRouteGuard>
        }
      />
    </Routes>
  );
};

// Puts each extension's `pages` into its host's AppLayout: links in the main
// sidebar, the page in place of the host's own routes in any of the host's
// layouts (`sales`, `sales:settings`).
export const HostedExtensionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const extensions = useExtensions();

  const value = useMemo(() => {
    const pages = (host: string) =>
      extensions
        .filter(({ config }) => config.host === host)
        .flatMap(({ pluginName, config }) =>
          (config.pages ?? []).map((page) => ({
            ...page,
            pluginName,
            path: `${host}/${page.path}`,
          })),
        );

    return {
      links: (layoutId: string) =>
        pages(layoutId).map(({ label, path, icon }) => ({
          name: label,
          path,
          icon,
        })),
      page: (layoutId: string, pathname: string) => {
        const page = pages(layoutId.split(':')[0])
          .filter(({ path }) => ownsPath(path, pathname))
          .sort((a, b) => b.path.length - a.path.length)[0];

        return page ? (
          <HostedPageRoute
            page={{
              pluginName: page.pluginName,
              path: page.path,
              component: page.component,
            }}
          />
        ) : null;
      },
    };
  }, [extensions]);

  return (
    <SafeAppLayoutExtensionsProvider value={value}>
      {children}
    </SafeAppLayoutExtensionsProvider>
  );
};
