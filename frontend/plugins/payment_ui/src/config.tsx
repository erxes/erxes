import { IconCurrencyDollar, IconInvoice } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { SEARCH_PROVIDERS } from '~/searchProviders';

export const CONFIG: IUIConfig = {
  name: 'payment',
  path: 'payment',
  icon: IconCurrencyDollar,
  navigationGroup: {
    name: 'payment',
    defaultPath: 'payment/invoices',
    icon: IconCurrencyDollar,
  },
  modules: [
    {
      name: 'payment-methods',
      icon: IconCurrencyDollar,
      path: 'payment/settings/methods',
    },
    {
      name: 'invoices',
      icon: IconInvoice,
      path: 'payment/invoices',
    },
    {
      name: 'corporate-gateway',
      icon: IconCurrencyDollar,
      path: 'payment/settings/corporate-gateway',
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
