import { IconCurrencyDollar, IconInvoice } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { SEARCH_PROVIDERS } from './searchProviders';

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
  widgets: {
    relationWidgets: [
      {
        name: 'invoices',
        icon: IconInvoice,
      },
    ],
  },
  searchProviders: SEARCH_PROVIDERS,
};
