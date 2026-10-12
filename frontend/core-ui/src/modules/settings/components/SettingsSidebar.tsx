import {
  GET_SETTINGS_PATH_DATA,
  SETTINGS_PERMISSION_MAP,
  TSettingSubPath,
} from '../constants/data';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NavigationMenuLinkItem, Sidebar, cn } from 'erxes-ui';
import React, { useEffect, useMemo, useState } from 'react';
import { pluginsConfigState, usePermissionCheck, useVersion } from 'ui-modules';

import { AppPath } from '@/types/paths/AppPath';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import { NavigationDisclosure } from '@/navigation/components/navigation-activity-rail/NavigationDisclosure';
import { findActiveNavigationPath } from '@/navigation/utils/navigationPathMatch';
import { getNavigationPlacement } from '@/navigation/utils/navigationPlacement';
import { useAtomValue } from 'jotai';
import { usePageTrackerStore } from 'react-page-tracker';
import { useSettingsSubNavigation } from '@/settings/hooks/useSettingsSubNavigation';
import { useTranslation } from 'react-i18next';

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
    <>
      <SettingsExitButton />
      <Sidebar.Content className="styled-scroll gap-1">
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
    </>
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
  const itemPath = `/${AppPath.Settings}/${path}`;
  const inItem =
    location.pathname === itemPath ||
    location.pathname.startsWith(`${itemPath}/`);
  const [open, setOpen] = useState(inItem);

  useEffect(() => {
    if (inItem) setOpen(true);
  }, [inItem]);

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

  const handleParentClick = (event: React.MouseEvent) => {
    if (!inItem) return setOpen(true);
    event.preventDefault();
    setOpen((previous) => !previous);
  };
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
      aria-expanded={open}
      onClick={handleParentClick}
      action={
        <NavigationDisclosure open={open}>
          <Sidebar.Sub className="border-l">
            {subPaths.map((subPath) => (
              <Sidebar.SubItem key={subPath.path}>
                <Sidebar.SubButton
                  asChild
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
          open && 'rotate-90',
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
    <Sidebar.Group className="px-4 py-1">
      <Sidebar.GroupLabel>{name}</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
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
    <Sidebar.Header className="sticky top-0 z-10 bg-sidebar px-2 pt-0 pb-1 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-sidebar after:to-transparent">
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
