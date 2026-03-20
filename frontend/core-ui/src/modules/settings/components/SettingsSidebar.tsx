import { AppPath } from '@/types/paths/AppPath';
import { IconChevronLeft } from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTrackerStore } from 'react-page-tracker';
import { useNavigate } from 'react-router-dom';
import { pluginsConfigState, useVersion, usePermissionCheck } from 'ui-modules';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import { GET_SETTINGS_PATH_DATA } from '../constants/data';
import { SettingsWorkspacePath } from '@/types/paths/SettingsPath';

const SETTINGS_PERMISSION_MAP: Record<string, string> = {
  [SettingsWorkspacePath.TeamMember]: 'teamMembers',
  [SettingsWorkspacePath.Structure]: 'organization',
  [SettingsWorkspacePath.Tags]: 'tags',
  [SettingsWorkspacePath.Brands]: 'brands',
  [SettingsWorkspacePath.Properties]: 'properties',
  [SettingsWorkspacePath.Products]: 'products',
  [SettingsWorkspacePath.ClientPortals]: 'clientPortal',
  [SettingsWorkspacePath.Permissions]: 'permissions',
};

export function SettingsSidebar() {
  const pluginsMetaData = useAtomValue(pluginsConfigState) || {};
  const { isLoaded, isWildcard, hasModulePermission, hasPluginPermission } =
    usePermissionCheck();

  const version = useVersion();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  const CORE_MODULES = GET_CORE_MODULES(t, version);
  const sidebar = useMemo(() => GET_SETTINGS_PATH_DATA(version, t), [t]);

  const filterByPermission = (items: typeof sidebar.nav) => {
    if (!isLoaded || isWildcard) return items;
    return items.filter((item) => {
      const requiredModule = SETTINGS_PERMISSION_MAP[item.path];
      if (!requiredModule) return true;
      return hasModulePermission(requiredModule);
    });
  };

  const pluginsWithSettingsNavigations = Object.values(pluginsMetaData)
    .filter((plugin) => {
      if (!plugin.settingsNavigation) return false;
      if (!isLoaded || isWildcard) return true;
      return hasPluginPermission(plugin.name);
    })
    .map((plugin) => ({
      Navigation: plugin.settingsNavigation,
      name: plugin.name,
    }));

  const filteredNav = filterByPermission(sidebar.nav);
  const filteredDeveloper = filterByPermission(sidebar.developer);

  const filteredCoreModules = CORE_MODULES.filter((item) => {
    if (!item.hasSettings) return false;
    if (!isLoaded || isWildcard) return true;
    return hasModulePermission(item.path);
  });

  return (
    <>
      <Sidebar.Content className="styled-scroll gap-2">
        <SettingsExitButton />
        <SettingsNavigationGroup name={t('account')}>
          {sidebar.account.map((item) => (
            <NavigationMenuLinkItem
              key={item.name}
              pathPrefix={AppPath.Settings}
              path={item.path}
              name={item.name}
            />
          ))}
        </SettingsNavigationGroup>
        <SettingsNavigationGroup name={t('workspace')}>
          {filteredNav.map((item) => (
            <NavigationMenuLinkItem
              pathPrefix={AppPath.Settings}
              path={item.path}
              name={item.name}
              key={item.name}
            />
          ))}
        </SettingsNavigationGroup>

        <SettingsNavigationGroup name={t('developer')}>
          {filteredDeveloper.map((item) => (
            <NavigationMenuLinkItem
              pathPrefix={AppPath.Settings}
              path={item.path}
              name={item.name}
              key={item.name}
            />
          ))}
        </SettingsNavigationGroup>

        <SettingsNavigationGroup name={t('core-modules')}>
          {filteredCoreModules.map((item) => (
            <NavigationMenuLinkItem
              key={item.name}
              pathPrefix={AppPath.Settings}
              path={item.path}
              name={item.name}
            />
          ))}
        </SettingsNavigationGroup>

        {pluginsWithSettingsNavigations.map(
          ({ Navigation, name }) => Navigation && <Navigation key={name} />,
        )}
      </Sidebar.Content>
    </>
  );
}

export const SettingsNavigationGroup = ({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) => {
  if (React.Children.count(children) === 0) return null;

  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">{name}</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>{children}</Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};

export const SettingsExitButton = () => {
  const navigate = useNavigate();
  const pageHistory = usePageTrackerStore((state) => state.pageHistory);

  const handleExitSettings = () =>
    navigate(
      pageHistory.reverse().find((page) => !page.includes('settings')) || '/',
    );

  const { t } = useTranslation('common', {
    keyPrefix: 'sidebar',
  });

  return (
    <Sidebar.Header className="p-4">
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton onClick={handleExitSettings}>
            <IconChevronLeft />
            <span>{t('exit-settings')}</span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Header>
  );
};
