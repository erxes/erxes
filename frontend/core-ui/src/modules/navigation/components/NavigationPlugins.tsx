import {
  activePluginState,
  NavigationMenuGroup,
  NavigationMenuGroupHover,
  NavigationMenuItem,
} from 'erxes-ui';
import { usePluginsNavigationGroups } from '../hooks/usePluginsNavigationGroups';
import { useAtom } from 'jotai';

export const NavigationPluginExitButton = () => {
  const [activePlugin, setActivePlugin] = useAtom(activePluginState);
  const navigationGroups = usePluginsNavigationGroups();

  const otherPlugins = Object.entries(navigationGroups).filter(
    ([name]) => name !== activePlugin,
  );

  if (!activePlugin) {
    return null;
  }

  return (
    <NavigationMenuGroupHover
      name={`Exit ${activePlugin.charAt(0).toUpperCase() + activePlugin.slice(1)}`}
      separate={false}
      onNameClick={() => setActivePlugin(null)}
    >
      {otherPlugins.map(([name, group]) => (
        <NavigationMenuItem
          key={name}
          name={name}
          icon={group.icon}
          onClick={() => {
            setActivePlugin(name);
          }}
        />
      ))}
    </NavigationMenuGroupHover>
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
        <NavigationMenuItem
          key={name}
          name={name}
          icon={group.icon}
          onClick={() => {
            setActivePlugin(name);
          }}
        />
      ))}
    </NavigationMenuGroup>
  );
};
