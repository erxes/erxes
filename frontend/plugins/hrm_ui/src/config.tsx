import { IconUsersGroup } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { SEARCH_PROVIDERS } from '~/searchProviders';

const MainNavigation = lazy(() =>
  import('@/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const SettingsNavigation = lazy(() =>
  import('@/SettingsNavigation').then((module) => ({
    default: module.SettingsNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'hrm',
  path: 'hrm',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <SettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'hrm',
    defaultPath: 'hrm/main',
    icon: IconUsersGroup,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'config',
      icon: IconUsersGroup,
      path: 'settings/hrm/config',
    },
  ],
  searchProviders: SEARCH_PROVIDERS,
};
