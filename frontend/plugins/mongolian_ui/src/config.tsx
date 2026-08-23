import { IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
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
  name: 'mongolian',
  path: 'mongolian',
  hasFloatingWidget: true,
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <SettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'mongolian',
    defaultPath: 'mongolian/put-response',
    icon: IconSandbox,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
  },
  widgets: {},
  modules: [
    {
      name: 'put-response',
      icon: IconSandbox,
      path: 'mongolian/put-response',
    },
    {
      name: 'sync-erkhet',
      icon: IconSandbox,
      path: 'mongolian/sync-erkhet',
    },
    {
      name: 'msdynamic',
      icon: IconSandbox,
      path: 'mongolian/msdynamic',
    },
    {
      name: 'ebarimt',
      icon: IconSandbox,
      path: 'settings/mongolian/ebarimt',
    },
    {
      name: 'erkhet-settings',
      icon: IconSandbox,
      path: 'settings/mongolian/sync-erkhet',
    },
    {
      name: 'product-places',
      icon: IconSandbox,
      path: 'settings/mongolian/product-places',
    },
    {
      name: 'exchange-rates',
      icon: IconSandbox,
      path: 'settings/mongolian/exchange-rates',
    },
    {
      name: 'msdynamic-settings',
      icon: IconSandbox,
      path: 'settings/mongolian/msdynamic',
    },
  ],
  searchProviders: SEARCH_PROVIDERS,
};
