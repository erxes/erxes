import { IconChevronLeft } from '@tabler/icons-react';
import { activePluginState, NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { usePluginsNavigationGroups } from '../hooks/usePluginsNavigationGroups';
import { useAtom } from 'jotai';

// Group names that contain spaces or uppercase are explicit display labels
// (e.g. "erxes AI Agents") — render them verbatim. Plain identifiers like
// "sales" keep the historical first-letter capitalization.
const displayName = (name: string) =>
  /[\sA-Z]/.test(name) ? name : name.charAt(0).toUpperCase() + name.slice(1);

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
              Exit {displayName(activePlugin)}
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
          name={`${displayName(activePlugin)} modules`}
          separate
        >
          {navigationGroups[activePlugin].contents.map((Content, index) => (
            <Content key={index} />
          ))}
        </NavigationMenuGroup>
        {subGroups.map((SubGroup, index) => (
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
            <span>{displayName(name)}</span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      ))}
    </NavigationMenuGroup>
  );
};
