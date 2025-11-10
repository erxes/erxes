import { IconCashBanknote } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

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

export const CONFIG: IUIConfig = {
  name: 'accounting',
  navigationGroup: {
    name: 'accounting',
    icon: IconCashBanknote,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
    subGroups: () => (
      <Suspense fallback={<div />}>
        <AdjustmentNavigation />
      </Suspense>
    ),
  },
  icon: IconCashBanknote,
  modules: [
    {
      name: 'accounting',
      icon: IconCashBanknote,
      path: 'accounting',
      hasSettings: true,
      hasRelationWidget: false,
    },
  ],
};
