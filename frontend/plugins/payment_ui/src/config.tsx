import { IconCurrencyDollar } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';


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
  )
};
