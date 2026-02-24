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
  navigationGroup: {
    name: 'Payment',
    icon: IconCurrencyDollar,
    content: () => null,
  },
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <PaymentSettingsNavigation />
    </Suspense>
  ),
};
