import { MS_DYNAMIC_SESSION_KEYS } from '../constants/msDynamicSessionKey';

export const MSDYNAMIC_ROUTES = [
  {
    label: 'Sync History',
    value: 'sync-history',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.syncHistory,
  },
  {
    label: 'Check Orders',
    value: 'synced-orders',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.syncedOrders,
  },
  {
    label: 'Check Categories',
    value: 'categories',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.categories,
  },
  {
    label: 'Check Products',
    value: 'products',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.products,
  },
  {
    label: 'Check Price',
    value: 'prices',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.prices,
  },
  {
    label: 'Check Customers',
    value: 'customers',
    sessionKey: MS_DYNAMIC_SESSION_KEYS.customers,
  },
];
