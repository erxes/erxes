import { useNavigate } from 'react-router-dom';

import { IconChevronLeft } from '@tabler/icons-react';

import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';

import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';
import { pluginsConfigState } from 'ui-modules';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import { SETTINGS_PATH_DATA } from '../constants/data';

import React, { useMemo } from 'react';
import { usePageTrackerStore } from 'react-page-tracker';
import { useVersion } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export function SettingsSidebar() {
  const pluginsMetaData = useAtomValue(pluginsConfigState) || {};

  const version = useVersion();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  const CORE_MODULES = GET_CORE_MODULES(t, version);
  const sidebar = useMemo(() => SETTINGS_PATH_DATA(t), [t]);

  const pluginsWithSettingsNavigations = Object.values(pluginsMetaData)
    .filter((plugin) => plugin.settingsNavigation)
    .map((plugin) => ({
      Navigation: plugin.settingsNavigation,
      name: plugin.name,
    }));

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
          {sidebar.nav.map((item) => (
            <NavigationMenuLinkItem
              pathPrefix={AppPath.Settings}
              path={item.path}
              name={item.name}
              key={item.name}
            />
          ))}
        </SettingsNavigationGroup>

        <SettingsNavigationGroup name={t('developer')}>
          {sidebar.developer.map((item) => (
            <NavigationMenuLinkItem
              pathPrefix={AppPath.Settings}
              path={item.path}
              name={item.name}
              key={item.name}
            />
          ))}
        </SettingsNavigationGroup>

        <SettingsNavigationGroup name={t('core-modules')}>
          {CORE_MODULES.filter((item) => item.hasSettings).map((item) => (
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
