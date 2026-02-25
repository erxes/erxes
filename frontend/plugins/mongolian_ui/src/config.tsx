import { IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { lazy, Suspense } from 'react';

const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const SettingsNavigation = lazy(() =>
  import('./modules/SettingsNavigation').then((module) => ({
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
      name: 'ebarimt',
      icon: IconSandbox,
      path: 'mongolian/ebarimt',
    },
    {
      name: 'sync-erkhet',
      icon: IconSandbox,
      path: 'mongolian/sync-erkhet',
    },
    {
      name: 'sync-erkhet-history',
      icon: IconSandbox,
      path: 'mongolian/sync-erkhet-history',
    },
    {
      name: 'check-synced-deals',
      icon: IconSandbox,
      path: 'mongolian/check-synced-deals',
    },
    {
      name: 'check-pos-orders',
      icon: IconSandbox,
      path: 'mongolian/check-pos-orders',
    },
    {
      name: 'check-category',
      icon: IconSandbox,
      path: 'mongolian/check-category',
    },
    {
      name: 'check-products',
      icon: IconSandbox,
      path: 'mongolian/check-products',
    },
    {
      name: 'put-response',
      icon: IconSandbox,
      path: 'mongolian/put-response',
    },
    {
      name: 'put-responses-by-date',
      icon: IconSandbox,
      path: 'mongolian/put-responses-by-date',
    },
    {
      name: 'put-responses-duplicated',
      icon: IconSandbox,
      path: 'mongolian/put-responses-duplicated',
    },
    {
      name: 'productplaces',
      icon: IconSandbox,
      path: 'mongolian/product-places',
    },
    {
      name: 'msdynamic',
      icon: IconSandbox,
      path: 'mongolian/msdynamic',
    },
  ],
};