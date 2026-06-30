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

const MONGOLIAN_EXACT_FAVORITE_NAMES: Record<string, string> = {
  'mongolian/ebarimt': 'EBarimt',
  'mongolian/put-response': 'Put Response',
  'mongolian/sync-erkhet': 'Sync Erkhet',
  'mongolian/msdynamic': 'MSDynamic',
  'mongolian/product-places': 'Product Places',
  'mongolian/exchange-rates': 'Exchange Rates',
};

const MONGOLIAN_SUFFIX_FAVORITE_NAMES: Array<[string, string]> = [
  ['/put-response/put-response', 'Put Response'],
  ['/put-response/by-date', 'Put Response / By Date'],
  ['/put-response/duplicated', 'Put Response / Duplicated'],
  ['/sync-erkhet/history', 'Sync Erkhet / History'],
  ['/sync-erkhet/deals', 'Sync Erkhet / Deals'],
  ['/sync-erkhet/products', 'Sync Erkhet / Products'],
  ['/sync-erkhet/category', 'Sync Erkhet / Categories'],
  ['/sync-erkhet/pos-order', 'Sync Erkhet / POS Orders'],
  ['/msdynamic/sync-history', 'MSDynamic / History'],
  ['/msdynamic/synced-orders', 'MSDynamic / Orders'],
  ['/msdynamic/customers', 'MSDynamic / Customers'],
  ['/msdynamic/products', 'MSDynamic / Products'],
  ['/msdynamic/categories', 'MSDynamic / Categories'],
  ['/msdynamic/prices', 'MSDynamic / Prices'],
];

const getMongolianFavoriteName = (path: string) => {
  const pathWithoutQuery = path.split('?')[0].replace(/^\/|\/$/g, '');

  const exactName = MONGOLIAN_EXACT_FAVORITE_NAMES[pathWithoutQuery];
  if (exactName) return exactName;

  const suffixName = MONGOLIAN_SUFFIX_FAVORITE_NAMES.find(([suffix]) =>
    pathWithoutQuery.endsWith(suffix),
  )?.[1];

  if (suffixName) return suffixName;

  if (pathWithoutQuery.includes('/msdynamic/pos-order-detail/')) {
    return 'MSDynamic / Order Detail';
  }

  return 'Mongolian';
};

type MongolianModule = NonNullable<IUIConfig['modules']>[number];

const mongolianModule = (
  name: string,
  path: string,
  favoriteName: MongolianModule['favoriteName'] = getMongolianFavoriteName,
): MongolianModule => ({
  name,
  icon: IconSandbox,
  path,
  favoriteName,
});

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
    mongolianModule('ebarimt', 'mongolian/ebarimt'),
    mongolianModule('sync-erkhet', 'mongolian/sync-erkhet'),
    mongolianModule(
      'sync-erkhet-history',
      'mongolian/sync-erkhet-history',
      'Sync Erkhet / History',
    ),
    mongolianModule(
      'check-synced-deals',
      'mongolian/check-synced-deals',
      'Sync Erkhet / Deals',
    ),
    mongolianModule(
      'check-pos-orders',
      'mongolian/check-pos-orders',
      'Sync Erkhet / POS Orders',
    ),
    mongolianModule(
      'check-category',
      'mongolian/check-category',
      'Sync Erkhet / Categories',
    ),
    mongolianModule(
      'check-products',
      'mongolian/check-products',
      'Sync Erkhet / Products',
    ),
    mongolianModule('put-response', 'mongolian/put-response'),
    mongolianModule(
      'put-responses-by-date',
      'mongolian/put-responses-by-date',
      'Put Response / By Date',
    ),
    mongolianModule(
      'put-responses-duplicated',
      'mongolian/put-responses-duplicated',
      'Put Response / Duplicated',
    ),
    mongolianModule('productplaces', 'mongolian/product-places'),
    mongolianModule('msdynamic', 'mongolian/msdynamic'),
    mongolianModule('exchange-rates', 'mongolian/exchange-rates'),
  ],
};
