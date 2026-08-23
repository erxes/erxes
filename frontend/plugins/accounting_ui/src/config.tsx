import { IconCashBanknote, IconReceipt } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { SEARCH_PROVIDERS } from '~/searchProviders';

const MainNavigation = lazy(() =>
  import('@/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const AdjustmentNavigation = lazy(() =>
  import('@/AdjustmentNavigation').then((mod) => ({
    default: mod.AdjustmentNavigation,
  })),
);

const InventoriesNavigation = lazy(() =>
  import('@/InventoriesNavigation').then((mod) => ({
    default: mod.InventoriesNavigation,
  })),
);

const SettingsNavigation = lazy(() =>
  import('@/SettingsNavigation').then((module) => ({
    default: module.SettingsNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'accounting',
  path: 'accounting',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <SettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'accounting',
    defaultPath: 'accounting/main',
    icon: IconCashBanknote,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
    subGroup: () => (
      <Suspense fallback={<div />}>
        <AdjustmentNavigation />
        <InventoriesNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'documents',
      icon: IconCashBanknote,
      path: 'accounting/main',
    },
    {
      name: 'records',
      icon: IconCashBanknote,
      path: 'accounting/records',
    },
    {
      name: 'odd-transactions',
      icon: IconCashBanknote,
      path: 'accounting/odd-transactions',
    },
    {
      name: 'journal-reports',
      icon: IconCashBanknote,
      path: 'accounting/journal-reports',
    },
    {
      name: 'check-sync',
      icon: IconCashBanknote,
      path: 'accounting/check-sync',
    },
    {
      name: 'config',
      icon: IconCashBanknote,
      path: 'settings/accounting/config',
    },
    {
      name: 'fixed-assets',
      icon: IconCashBanknote,
      path: 'settings/accounting/fixed-assets',
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'transactions',
        icon: IconReceipt,
      },
    ],
  },
  searchProviders: SEARCH_PROVIDERS,
};
