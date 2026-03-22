import { Suspense, useEffect, useState } from 'react';
import { IconChevronLeft } from '@tabler/icons-react';
import { activePluginState, NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { ErrorBoundary } from 'react-error-boundary';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { usePluginsNavigationGroups } from '../hooks/usePluginsNavigationGroups';
import { useAtom } from 'jotai';

/** Loads a remote Module Federation component by path. */
function useRemoteComponent(remotePath: string) {
  const [Component, setComponent] =
    useState<React.ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadRemote<{ default: React.ComponentType }>(remotePath, {
      from: 'runtime',
    })
      .then((mod) => {
        if (!cancelled && mod?.default) {
          setComponent(() => mod.default);
        }
      })
      .catch(() => {
        /* sub-navigation is non-critical */
      });

    return () => {
      cancelled = true;
    };
  }, [remotePath]);

  return Component;
}

/** Renders a sub-navigation component loaded from a remote plugin via loadRemote. */
function RemoteSubNavigation({
  pluginName,
  exposeName,
}: {
  pluginName: string;
  exposeName: string;
}) {
  const Component = useRemoteComponent(`${pluginName}_ui/${exposeName}`);

  if (!Component) return null;

  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}

/** Logs remote component render errors in development. */
function handleRemoteError(error: Error) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[NavigationPlugins] Remote component failed to render:',
      error.message,
    );
  }
}

/** Back button shown when a plugin navigation group is expanded. */
export const NavigationPluginExitButton = () => {
  const [activePlugin, setActivePlugin] = useAtom(activePluginState);

  if (!activePlugin) {
    return null;
  }

  return (
    <>
      <Sidebar.Menu className="px-4 py-2">
        <Sidebar.MenuItem>
          <Sidebar.MenuButton onClick={() => setActivePlugin(null)}>
            <IconChevronLeft className="text-accent-foreground" />
            <span className="font-sans font-semibold text-accent-foreground">
              Exit {activePlugin}
            </span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
      <Sidebar.Separator className="mx-0" />
    </>
  );
};

/** Renders plugin navigation groups in the sidebar with remote sub-navigation. */
export const NavigationPlugins = () => {
  const navigationGroups = usePluginsNavigationGroups();
  const [activePlugin, setActivePlugin] = useAtom(activePluginState);

  if (Object.entries(navigationGroups).length === 0) {
    return null;
  }

  if (activePlugin && navigationGroups[activePlugin]) {
    const { subGroups } = navigationGroups[activePlugin];
    return (
      <>
        <NavigationMenuGroup
          name={
            activePlugin.charAt(0).toUpperCase() +
            activePlugin.slice(1) +
            ' modules'
          }
          separate
        >
          {navigationGroups[activePlugin].contents.map(
            ({ render: Content, pluginName }) => (
              <ErrorBoundary
                key={pluginName}
                fallbackRender={() => null}
                onError={handleRemoteError}
              >
                <Content />
              </ErrorBoundary>
            ),
          )}
        </NavigationMenuGroup>
        {subGroups.map(({ exposeName, pluginName }) => (
          <ErrorBoundary
            key={`${pluginName}-${exposeName}`}
            fallbackRender={() => null}
            onError={handleRemoteError}
          >
            <RemoteSubNavigation
              pluginName={pluginName}
              exposeName={exposeName}
            />
          </ErrorBoundary>
        ))}
      </>
    );
  }

  return (
    <NavigationMenuGroup name="Plugins">
      {Object.entries(navigationGroups).map(([name, group]) => (
        <Sidebar.MenuItem key={name}>
          <Sidebar.MenuButton onClick={() => setActivePlugin(name)}>
            {group.icon && <group.icon className="text-accent-foreground" />}
            <span className="capitalize">{name}</span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      ))}
    </NavigationMenuGroup>
  );
};
