
import { IconCurrencyDollar } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

const PaymentNavigation = lazy(() =>
  import('./modules/PaymentNavigation').then((module) => ({
    default: module.PaymentNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'payment',
  navigationGroup: {
    name: 'payment',
    icon: IconCurrencyDollar,
    content: () => (
      <Suspense fallback={<div />}>
        <PaymentNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'payment',
      icon: IconCurrencyDollar,
      path: 'payment',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
