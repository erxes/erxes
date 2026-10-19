import { IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { mongolianProductRemainderProvider } from '@/erkhet-sync/product-remainders/productRemainderProvider';
import { SEARCH_PROVIDERS } from '~/searchProviders';

export const CONFIG: IUIConfig = {
  name: 'mongolian',
  path: 'mongolian',
  hasFloatingWidget: true,
  navigationGroup: {
    name: 'mongolian',
    defaultPath: 'mongolian/put-response',
    icon: IconSandbox,
  },
  widgets: {
    productRemainderProviders: [mongolianProductRemainderProvider],
  },
  modules: [
    {
      name: 'put-response',
      icon: IconSandbox,
      path: 'mongolian/put-response',
    },
    {
      name: 'sync-erkhet',
      icon: IconSandbox,
      path: 'mongolian/sync-erkhet',
    },
    {
      name: 'msdynamic',
      icon: IconSandbox,
      path: 'mongolian/msdynamic',
    },
    {
      name: 'ebarimt',
      icon: IconSandbox,
      path: 'mongolian/settings/ebarimt',
    },
    {
      name: 'erkhet-settings',
      icon: IconSandbox,
      path: 'mongolian/settings/sync-erkhet',
    },
    {
      name: 'product-places',
      icon: IconSandbox,
      path: 'mongolian/settings/product-places',
    },
    {
      name: 'exchange-rates',
      icon: IconSandbox,
      path: 'mongolian/settings/exchange-rates',
    },
    {
      name: 'msdynamic-settings',
      icon: IconSandbox,
      path: 'mongolian/settings/msdynamic',
    },
  ],
  searchProviders: SEARCH_PROVIDERS,
};
