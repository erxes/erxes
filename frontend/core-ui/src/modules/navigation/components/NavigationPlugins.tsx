import { IconChevronLeft } from '@tabler/icons-react';
import {
  activePluginState,
  HoverCard,
  NavigationMenuGroup,
  Sidebar,
} from 'erxes-ui';
import {
  NavigationGroupResult,
  usePluginsNavigationGroups,
} from '../hooks/usePluginsNavigationGroups';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

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

export const NavigationPluginExitButton = () => {
  const [activePlugin, setActivePlugin] = useAtom(activePluginState);

  const navigationGroups = usePluginsNavigationGroups();

  const { t } = useTranslation('common', { keyPrefix: 'plugin' });

  const pluginName = usePluginDisplayName(
    activePlugin ?? '',
    activePlugin ? navigationGroups[activePlugin]?.i18n : false,
  );

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
              {t('exit', { name: pluginName })}
            </span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
      <Sidebar.Separator className="mx-0" />
    </>
  );
};

const NavigationPluginModules = ({
  activePlugin,
  separate = true,
}: {
  activePlugin: string;
  separate?: boolean;
}) => {
  const navigationGroups = usePluginsNavigationGroups();

  const { t } = useTranslation('common', { keyPrefix: 'plugin' });

  const { contents, subGroups, i18n } = navigationGroups[activePlugin];

  const pluginName = usePluginDisplayName(activePlugin, i18n);

  return (
    <>
      <NavigationMenuGroup
        name={t('modules', { name: pluginName })}
        separate={separate}
      >
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

const NavigationPluginMenu = ({
  name,
  group,
  setActivePlugin,
}: {
  name: string;
  group: NavigationGroupResult;
  setActivePlugin: (name: string) => void;
}) => {
  const pluginName = usePluginDisplayName(name, group.i18n);
  const { collapseState } = Sidebar.useSidebar();
  const Icon = group.icon;
  const isCollapsed = collapseState === 'collapsed';
  const menuButton = (
    <Sidebar.MenuButton
      onClick={() => setActivePlugin(name)}
      tooltip={pluginName}
    >
      {Icon && <Icon className="text-accent-foreground" />}
      <span>{pluginName}</span>
    </Sidebar.MenuButton>
  );

  if (!isCollapsed) {
    return <Sidebar.MenuItem>{menuButton}</Sidebar.MenuItem>;
  }

  return (
    <Sidebar.MenuItem>
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCard.Trigger asChild>{menuButton}</HoverCard.Trigger>
        <HoverCard.Content align="start" className="w-72 p-0" side="right">
          <NavigationPluginModules activePlugin={name} separate={false} />
        </HoverCard.Content>
      </HoverCard>
    </Sidebar.MenuItem>
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
        <NavigationPluginMenu
          key={name}
          name={name}
          group={group}
          setActivePlugin={setActivePlugin}
        />
      ))}
    </NavigationMenuGroup>
  );
};
