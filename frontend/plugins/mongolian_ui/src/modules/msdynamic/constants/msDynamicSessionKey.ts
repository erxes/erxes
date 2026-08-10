export const MS_DYNAMIC_SESSION_KEYS = {
  syncHistory: 'ms-dynamic-sync-history-cursor',
  syncedOrders: 'ms-dynamic-synced-orders-cursor',
  categories: 'ms-dynamic-categories-cursor',
  products: 'ms-dynamic-products-cursor',
  prices: 'ms-dynamic-prices-cursor',
  customers: 'ms-dynamic-customers-cursor',
} as const;

export type MSDynamicTab = keyof typeof MS_DYNAMIC_SESSION_KEYS;

export const getMSDynamicSessionKey = (tab: MSDynamicTab) =>
  MS_DYNAMIC_SESSION_KEYS[tab];
