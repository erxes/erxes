import { IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { lazy, Suspense } from 'react';

const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const SettingsNavigation = lazy(() =>
  import('./modules/SettingsNavigation').then((module) => ({
    default: module.SettingsNavigation,
  })),
);

const getMongolianFavoriteName = (path: string) => {
  const pathWithoutQuery = path.split('?')[0].replace(/^\/|\/$/g, '');

  if (pathWithoutQuery === 'mongolian/ebarimt') return 'EBarimt';

  if (pathWithoutQuery === 'mongolian/put-response') return 'Put Response';
  if (pathWithoutQuery.endsWith('/put-response/put-response')) {
    return 'Put Response';
  }

  if (pathWithoutQuery.endsWith('/put-response/by-date')) {
    return 'Put Response / By Date';
  }

  if (pathWithoutQuery.endsWith('/put-response/duplicated')) {
    return 'Put Response / Duplicated';
  }

  if (pathWithoutQuery === 'mongolian/sync-erkhet') return 'Sync Erkhet';
  if (pathWithoutQuery.endsWith('/sync-erkhet/history')) {
    return 'Sync Erkhet / History';
  }

  if (pathWithoutQuery.endsWith('/sync-erkhet/deals')) {
    return 'Sync Erkhet / Deals';
  }

  if (pathWithoutQuery.endsWith('/sync-erkhet/products')) {
    return 'Sync Erkhet / Products';
  }

  if (pathWithoutQuery.endsWith('/sync-erkhet/category')) {
    return 'Sync Erkhet / Categories';
  }

  if (pathWithoutQuery.endsWith('/sync-erkhet/pos-order')) {
    return 'Sync Erkhet / POS Orders';
  }

  if (pathWithoutQuery === 'mongolian/msdynamic') return 'MSDynamic';
  if (pathWithoutQuery.endsWith('/msdynamic/sync-history')) {
    return 'MSDynamic / History';
  }

  if (pathWithoutQuery.endsWith('/msdynamic/synced-orders')) {
    return 'MSDynamic / Orders';
  }

  if (pathWithoutQuery.endsWith('/msdynamic/customers')) {
    return 'MSDynamic / Customers';
  }

  if (pathWithoutQuery.endsWith('/msdynamic/products')) {
    return 'MSDynamic / Products';
  }

  if (pathWithoutQuery.endsWith('/msdynamic/categories')) {
    return 'MSDynamic / Categories';
  }

  if (pathWithoutQuery.endsWith('/msdynamic/prices')) {
    return 'MSDynamic / Prices';
  }

  if (pathWithoutQuery.includes('/msdynamic/pos-order-detail/')) {
    return 'MSDynamic / Order Detail';
  }

  if (pathWithoutQuery === 'mongolian/product-places') {
    return 'Product Places';
  }

  if (pathWithoutQuery === 'mongolian/exchange-rates') {
    return 'Exchange Rates';
  }

  return 'Mongolian';
};

export const CONFIG: IUIConfig = {
  name: 'mongolian',
  path: 'mongolian',
  hasFloatingWidget: true,
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <SettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'mongolian',
    icon: IconSandbox,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
  },
  widgets: {},
  modules: [
    {
      name: 'ebarimt',
      icon: IconSandbox,
      path: 'mongolian/ebarimt',
      favoriteName: getMongolianFavoriteName,
    },
    {
      name: 'sync-erkhet',
      icon: IconSandbox,
      path: 'mongolian/sync-erkhet',
      favoriteName: getMongolianFavoriteName,
    },
    {
      name: 'sync-erkhet-history',
      icon: IconSandbox,
      path: 'mongolian/sync-erkhet-history',
      favoriteName: 'Sync Erkhet / History',
    },
    {
      name: 'check-synced-deals',
      icon: IconSandbox,
      path: 'mongolian/check-synced-deals',
      favoriteName: 'Sync Erkhet / Deals',
    },
    {
      name: 'check-pos-orders',
      icon: IconSandbox,
      path: 'mongolian/check-pos-orders',
      favoriteName: 'Sync Erkhet / POS Orders',
    },
    {
      name: 'check-category',
      icon: IconSandbox,
      path: 'mongolian/check-category',
      favoriteName: 'Sync Erkhet / Categories',
    },
    {
      name: 'check-products',
      icon: IconSandbox,
      path: 'mongolian/check-products',
      favoriteName: 'Sync Erkhet / Products',
    },
    {
      name: 'put-response',
      icon: IconSandbox,
      path: 'mongolian/put-response',
      favoriteName: getMongolianFavoriteName,
    },
    {
      name: 'put-responses-by-date',
      icon: IconSandbox,
      path: 'mongolian/put-responses-by-date',
      favoriteName: 'Put Response / By Date',
    },
    {
      name: 'put-responses-duplicated',
      icon: IconSandbox,
      path: 'mongolian/put-responses-duplicated',
      favoriteName: 'Put Response / Duplicated',
    },
    {
      name: 'productplaces',
      icon: IconSandbox,
      path: 'mongolian/product-places',
      favoriteName: getMongolianFavoriteName,
    },
    {
      name: 'msdynamic',
      icon: IconSandbox,
      path: 'mongolian/msdynamic',
      favoriteName: getMongolianFavoriteName,
    },
    {
      name: 'exchange-rates',
      icon: IconSandbox,
      path: 'mongolian/exchange-rates',
      favoriteName: getMongolianFavoriteName,
    },
  ],
};
