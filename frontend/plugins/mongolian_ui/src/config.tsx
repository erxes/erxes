import { IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { lazy, Suspense } from 'react';
import { mongolianProductRemainderProvider } from '@/erkhet-sync/product-remainders/productRemainderProvider';
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
  plugin: {
    name: 'mongolian',
    color: 'oklch(0.55 0.19 27)',
    description: 'eBarimt, Erkhet and MS Dynamics sync',
    logo: (
      <>
        <path
          d="M13 10.5h22v27.5l-3.67-2.5-3.67 2.5-3.66-2.5-3.67 2.5-3.66-2.5L13 38z"
          fill="#fff"
        />
        <rect
          x="16.5"
          y="14.5"
          width="7"
          height="7"
          rx="1.2"
          fill="currentColor"
        />
        <rect x="18.6" y="16.6" width="2.8" height="2.8" fill="#fff" />
        <rect
          x="16.5"
          y="25"
          width="15"
          height="2.4"
          rx="1.2"
          fill="currentColor"
          opacity=".55"
        />
        <rect
          x="16.5"
          y="29.5"
          width="10"
          height="2.4"
          rx="1.2"
          fill="currentColor"
          opacity=".55"
        />
      </>
    ),
    defaultPath: 'mongolian/put-response',
    icon: IconSandbox,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
  },
  widgets: {
    productRemainderProviders: [mongolianProductRemainderProvider],
  },
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
