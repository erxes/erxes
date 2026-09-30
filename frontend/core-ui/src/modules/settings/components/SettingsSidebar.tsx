import { NavigationDisclosure } from '@/navigation/components/NavigationDisclosure';
import { AppPath } from '@/types/paths/AppPath';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { cn, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTrackerStore } from 'react-page-tracker';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { pluginsConfigState, useVersion, usePermissionCheck } from 'ui-modules';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import { findActiveNavigationPath } from '@/navigation/utils/navigationPathMatch';
import { getNavigationPlacement } from '@/navigation/utils/navigationPlacement';
import { useSettingsSubNavigation } from '@/settings/hooks/useSettingsSubNavigation';
import {
  GET_SETTINGS_PATH_DATA,
  SETTINGS_PERMISSION_MAP,
  TSettingSubPath,
} from '../constants/data';

export function SettingsSidebar() {
  const pluginsMetaData = useAtomValue(pluginsConfigState) || {};
  const { isLoaded, isWildcard, hasModulePermission, hasPluginPermission } =
    usePermissionCheck();

  const version = useVersion();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  const CORE_MODULES = GET_CORE_MODULES(t, version);
  const sidebar = useMemo(() => GET_SETTINGS_PATH_DATA(version, t), [t]);
  const subNavigation = useSettingsSubNavigation();

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
    <Sidebar.Content className="styled-scroll gap-2">
      <SettingsExitButton />
      <SettingsNavigationGroup name={t('account')}>
        {sidebar.account.map((item) => (
          <NavigationMenuLinkItem
            key={item.name}
            pathPrefix={AppPath.Settings}
            path={item.path}
            name={item.name}
            icon={item.icon}
          />
        ))}
      </SettingsNavigationGroup>
      <SettingsNavigationGroup name={t('workspace')}>
        {filteredNav.map((item) => (
          <SettingsNavigationItem
            key={item.name}
            path={item.path}
            name={item.name}
            icon={item.icon}
            subPaths={subNavigation[item.path]?.items}
          />
        ))}
      </SettingsNavigationGroup>

      <SettingsNavigationGroup name={t('developer')}>
        {filteredDeveloper.map((item) => (
          <NavigationMenuLinkItem
            pathPrefix={AppPath.Settings}
            path={item.path}
            name={item.name}
            icon={item.icon}
            key={item.name}
          />
        ))}
      </SettingsNavigationGroup>

      <SettingsNavigationGroup name={t('core-modules')}>
        {filteredCoreModules.map((item) => (
          <SettingsNavigationItem
            key={item.name}
            path={item.path}
            name={item.name}
            icon={item.icon}
            subPaths={subNavigation[item.path]?.items}
          />
        ))}
      </SettingsNavigationGroup>

      {pluginsWithSettingsNavigations.map(
        ({ Navigation, name }) => Navigation && <Navigation key={name} />,
      )}
    </Sidebar.Content>
  );
}

function SettingsNavigationItem({
  path,
  name,
  icon,
  subPaths,
}: Readonly<{
  path: string;
  name: string;
  icon?: React.ElementType;
  subPaths?: TSettingSubPath[];
}>) {
  const location = useLocation();
  const { isMobile } = Sidebar.useSidebar();

  if (
    !subPaths ||
    (!isMobile && getNavigationPlacement(subPaths.length) === 'context')
  ) {
    return (
      <NavigationMenuLinkItem
        pathPrefix={AppPath.Settings}
        path={path}
        name={name}
        icon={icon}
      />
    );
  }

  const itemPath = `/${AppPath.Settings}/${path}`;
  const inItem =
    location.pathname === itemPath ||
    location.pathname.startsWith(`${itemPath}/`);
  const activeSubPath = findActiveNavigationPath(
    subPaths.map((subPath) => subPath.path),
    location,
  );

  return (
    <NavigationMenuLinkItem
      pathPrefix={AppPath.Settings}
      path={path}
      name={name}
      icon={icon}
      aria-expanded={inItem}
      action={
        <NavigationDisclosure open={inItem}>
          <Sidebar.Sub className="border-l">
            {subPaths.map((subPath) => (
              <Sidebar.SubItem key={subPath.path}>
                <Sidebar.SubButton
                  asChild
                  className="font-medium"
                  isActive={subPath.path === activeSubPath}
                >
                  <Link to={subPath.path}>{subPath.name}</Link>
                </Sidebar.SubButton>
              </Sidebar.SubItem>
            ))}
          </Sidebar.Sub>
        </NavigationDisclosure>
      }
    >
      <span
        className={cn(
          'ml-auto flex shrink-0 text-muted-foreground transition-transform duration-200',
          inItem && 'rotate-90',
        )}
      >
        <IconChevronRight className="size-3.5!" />
      </span>
    </NavigationMenuLinkItem>
  );
}

export function SettingsNavigationGroup({
  name,
  children,
}: Readonly<{
  name: string;
  children: React.ReactNode;
}>) {
  if (React.Children.count(children) === 0) return null;

  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">{name}</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>{children}</Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
}

export function SettingsExitButton() {
  const navigate = useNavigate();
  const pageHistory = usePageTrackerStore((state) => state.pageHistory);

  const handleExitSettings = () =>
    navigate(
      [...pageHistory].reverse().find((page) => !page.includes('settings')) ||
        '/',
    );

  const { t } = useTranslation('common', {
    keyPrefix: 'sidebar',
  });

  return (
    <Sidebar.Header className="px-2 pt-0 pb-0">
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
}
