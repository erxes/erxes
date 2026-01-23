import { IconCashBanknote } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';
// import { SettingsPage } from './pages/SettingsPage';

const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const AdjustmentNavigation = lazy(() =>
  import('./modules/AdjustmentNavigation').then((mod) => ({
    default: mod.AdjustmentNavigation,
  })),
);

const SettingsNavigation = lazy(() =>
  import('./modules/SettingsNavigation').then((module) => ({
    default: module.SettingsNavigation,
  }))
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
    icon: IconCashBanknote,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
    subGroup: () => (
      <Suspense fallback={<div />}>
        <AdjustmentNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'accounting',
      icon: IconCashBanknote,
      path: 'accounting',
    },
  ],
};
