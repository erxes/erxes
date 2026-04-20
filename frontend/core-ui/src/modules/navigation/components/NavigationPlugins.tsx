import { lazy, Suspense } from 'react';
import { IconChevronLeft } from '@tabler/icons-react';
import { activePluginState, NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { ErrorBoundary } from 'react-error-boundary';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { usePluginsNavigationGroups } from '../hooks/usePluginsNavigationGroups';
import { useAtom } from 'jotai';

type RemoteModule = { default: React.ComponentType };

// Cache lazy components so re-renders don't recreate them — a fresh
// React.lazy() on every render would tear down its own Suspense boundary
// and cause an infinite loading flash.
const remoteCache = new Map<
  string,
  React.LazyExoticComponent<React.ComponentType>
>();

function getRemoteComponent(remotePath: string) {
  let Component = remoteCache.get(remotePath);
  if (!Component) {
    Component = lazy(async () => {
      const mod = await loadRemote<RemoteModule>(remotePath);
      if (!mod?.default) {
        throw new Error(
          `Module Federation remote '${remotePath}' did not provide a default export`,
        );
      }
      return mod;
    });
    remoteCache.set(remotePath, Component);
  }
  return Component;
}

function RemoteSubNavigation({
  pluginName,
  exposeName,
}: {
  pluginName: string;
  exposeName: string;
}) {
  const Component = getRemoteComponent(`${pluginName}_ui/${exposeName}`);
  return <Component />;
}

function reportRemoteError(error: Error, context: string) {
  console.error(`[NavigationPlugins] ${context} failed to render:`, error);
}

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
                onError={(error) =>
                  reportRemoteError(
                    error,
                    `navigation content for plugin '${pluginName}'`,
                  )
                }
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
            onError={(error) =>
              reportRemoteError(
                error,
                `sub-navigation '${pluginName}_ui/${exposeName}'`,
              )
            }
          >
            <Suspense fallback={null}>
              <RemoteSubNavigation
                pluginName={pluginName}
                exposeName={exposeName}
              />
            </Suspense>
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
