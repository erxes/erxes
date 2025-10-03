import { IconCashBanknote } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

const AccountingNavigation = lazy(() =>
  import('./modules/AccountingNavigation').then((module) => ({
    default: module.AccountingNavigation,
  })),
);


export const CONFIG: IUIConfig = {
  name: 'accounting',
  navigationGroup: {
    name: 'accounting',
    icon: IconCashBanknote,
    content: () => (
      <Suspense fallback={<div />}>
        <AccountingNavigation />
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
