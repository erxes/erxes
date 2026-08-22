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
  settingsOnly: true,
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <PaymentSettingsNavigation />
    </Suspense>
  ),
  modules: [
    {
      name: 'payment-methods',
      icon: IconCurrencyDollar,
      path: 'settings/payment/methods',
    },
    {
      name: 'invoices',
      icon: IconInvoice,
      path: 'settings/payment/invoices',
    },
    {
      name: 'corporate-gateway',
      icon: IconCurrencyDollar,
      path: 'settings/payment/corporate-gateway',
    },
  ],
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
