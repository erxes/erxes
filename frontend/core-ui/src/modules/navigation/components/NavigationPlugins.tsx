import {
  activePluginState,
  NavigationMenuGroup,
  NavigationMenuGroupHover,
  NavigationMenuItem,
} from 'erxes-ui';
import { usePluginsNavigationGroups } from '../hooks/usePluginsNavigationGroups';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

type NavigationGroup = ReturnType<typeof usePluginsNavigationGroups>[string];

// Group names that contain spaces or uppercase are explicit display labels
// (e.g. "erxes AI Agents") — render them verbatim. Plain identifiers like
// "sales" keep the historical first-letter capitalization.
const displayName = (name: string) =>
  /[\sA-Z]/.test(name) ? name : name.charAt(0).toUpperCase() + name.slice(1);

const usePluginDisplayName = (name: string, i18n?: boolean) => {
  const { t } = useTranslation(i18n ? name : 'common');

  if (!i18n) {
    return displayName(name);
  }

  return displayName(t(name, { defaultValue: '' }) || name);
};

const NavigationPluginItem = ({
  name,
  group,
  setActivePlugin,
}: {
  name: string;
  group: NavigationGroup;
  setActivePlugin: (name: string) => void;
}) => {
  const pluginName = usePluginDisplayName(name, group.i18n);

  return (
    <NavigationMenuItem
      name={pluginName}
      icon={group.icon}
      onClick={() => setActivePlugin(name)}
    />
  );
};

export const NavigationPluginExitButton = () => {
  const [activePlugin, setActivePlugin] = useAtom(activePluginState);
  const navigationGroups = usePluginsNavigationGroups();

  const { t } = useTranslation('common', { keyPrefix: 'plugin' });

  const pluginName = usePluginDisplayName(
    activePlugin ?? '',
    activePlugin ? navigationGroups[activePlugin]?.i18n : false,
  );

  const otherPlugins = Object.entries(navigationGroups).filter(
    ([name]) => name !== activePlugin,
  );

  if (!activePlugin) {
    return null;
  }

  return (
    <NavigationMenuGroupHover
      name={t('exit', { name: pluginName })}
      separate={false}
      onNameClick={() => setActivePlugin(null)}
    >
      {otherPlugins.map(([name, group]) => (
        <NavigationPluginItem
          key={name}
          name={name}
          group={group}
          setActivePlugin={setActivePlugin}
        />
      ))}
    </NavigationMenuGroupHover>
  );
};

const NavigationPluginModules = ({ activePlugin }: { activePlugin: string }) => {
  const navigationGroups = usePluginsNavigationGroups();

  const { t } = useTranslation('common', { keyPrefix: 'plugin' });

  const { contents, subGroups, i18n } = navigationGroups[activePlugin];

  const pluginName = usePluginDisplayName(activePlugin, i18n);

  return (
    <>
      <NavigationMenuGroup name={t('modules', { name: pluginName })} separate>
        {contents.map((Content, index) => (
          <Content key={index} />
        ))}
      </NavigationMenuGroup>
      {subGroups.map((SubGroup, index) => (
        <SubGroup key={index} />
      ))}
    </>
  );
};

export const NavigationPlugins = () => {
  const navigationGroups = usePluginsNavigationGroups();
  const [activePlugin, setActivePlugin] = useAtom(activePluginState);

  const { t } = useTranslation('common', { keyPrefix: 'plugin' });

  if (Object.entries(navigationGroups).length === 0) {
    return null;
  }

  if (activePlugin && navigationGroups[activePlugin]) {
    return <NavigationPluginModules activePlugin={activePlugin} />;
  }

  return (
    <NavigationMenuGroup name={t('plugins')}>
      {Object.entries(navigationGroups).map(([name, group]) => (
        <NavigationPluginItem
          key={name}
          name={name}
          group={group}
          setActivePlugin={setActivePlugin}
        />
      ))}
    </NavigationMenuGroup>
  );
};
