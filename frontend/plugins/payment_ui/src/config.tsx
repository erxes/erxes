import { IconCurrencyDollar } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

const PaymentNavigation = lazy(() =>
  import('./modules/PaymentNavigation').then((module) => ({
    default: module.PaymentNavigation,
  })),
);

const PaymentSettingsNavigation = lazy(() =>
  import('./modules/PaymentSettingsNavigation').then((module) => ({
    default: module.PaymentSettingsNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'payment',
  path: 'payment',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <PaymentSettingsNavigation />
    </Suspense>
  ),
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
      // hasRelationWidget: false,
      // hasFloatingWidget: false,
    },
  ],
};
