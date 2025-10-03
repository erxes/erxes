import { IconChevronLeft } from '@tabler/icons-react';
import { activePluginState, NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { usePluginsNavigationGroups } from '../hooks/usePluginsModules';
import { useAtom } from 'jotai';

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
          {navigationGroups[activePlugin].contents.map((Content, index) => (
            <Content key={index} />
          ))}
        </NavigationMenuGroup>
        {navigationGroups[activePlugin].subGroups.map((SubGroup, index) => (
          <SubGroup key={index} />
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
