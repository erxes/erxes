import { CHECK_SYNCED_DEALS_CURSOR_SESSION_KEY } from '@/erkhet-sync/check-synced-deals/constants/checkSyncedDealsCursorSessionKey';
import { CHECK_POS_ORDERS_CURSOR_SESSION_KEY } from '@/erkhet-sync/check-pos-orders/constants/checkPosOrdersCursorSessionKey';
import { CHECK_CATEGORY_CURSOR_SESSION_KEY } from '@/erkhet-sync/check-category/constants/checkCategoryCursorSessionKey';
import { CHECK_PRODUCTS_CURSOR_SESSION_KEY } from '@/erkhet-sync/check-products/constants/checkProductsCursorSessionKey';
import { SYNC_HISTORIES_CURSOR_SESSION_KEY } from '@/erkhet-sync/sync-erkhet-history/constants/syncErkhetHistoryCursorSessionKey';

export const SYNC_ERKHET_ROUTES = [
  {
    label: 'sync-history',
    value: 'history',
    sessionKey: SYNC_HISTORIES_CURSOR_SESSION_KEY,
  },
  {
    label: 'check-deals',
    value: 'deals',
    sessionKey: CHECK_SYNCED_DEALS_CURSOR_SESSION_KEY,
  },
  {
    label: 'check-orders',
    value: 'pos-order',
    sessionKey: CHECK_POS_ORDERS_CURSOR_SESSION_KEY,
  },
  {
    label: 'check-products',
    value: 'products',
    sessionKey: CHECK_PRODUCTS_CURSOR_SESSION_KEY,
  },
  {
    label: 'check-category',
    value: 'category',
    sessionKey: CHECK_CATEGORY_CURSOR_SESSION_KEY,
  },
];
