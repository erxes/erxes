import { MS_DYNAMIC_SESSION_KEYS } from '../constants/msDynamicSessionKey';

export const MSDYNAMIC_ROUTES = [
  {
    label: 'sync-history',
    value: 'sync-history',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.syncHistory,
  },
  {
    label: 'check-orders',
    value: 'synced-orders',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.syncedOrders,
  },
  {
    label: 'check-categories',
    value: 'categories',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.categories,
  },
  {
    label: 'check-products',
    value: 'products',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.products,
  },
  {
    label: 'check-price',
    value: 'prices',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.prices,
  },
  {
    label: 'check-customers',
    value: 'customers',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.customers,
  },
];
