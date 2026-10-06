export const SETTINGS_ROUTES = {
  '/settings/accounting/config': 'general-settings',
  account: '',
  '/settings/accounting/config/accounts': 'account',
  '/settings/accounting/config/account-categories': 'account-category',
  '/settings/accounting/config/permissions': 'account-permissions',
  tax: '',
  '/settings/accounting/config/vat-rows': 'vat-rules',
  '/settings/accounting/config/ctax-rows': 'city-tax-rules',
  sync: '',
  '/settings/accounting/config/sync-deal': 'deal-synchronization-rules',
  '/settings/accounting/config/sync-deal-movement':
    'deal-inventory-transfer-rules',
  '/settings/accounting/config/sync-deal-return': 'deal-return-rules',
  '/settings/accounting/config/sync-order': 'pos-order-synchronization-rules',
};

export enum ACCOUNTING_SETTINGS_CODES {
  SYNC_DEAL = 'syncDeal',
  SYNC_DEAL_MOVEMENT = 'syncDealMovement',
  SYNC_DEAL_RETURN = 'syncDealReturn',
  SYNC_ORDER = 'syncOrder',
}
