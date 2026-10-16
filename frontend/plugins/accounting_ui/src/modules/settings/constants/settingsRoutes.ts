export const SETTINGS_ROUTES = {
  '/settings/accounting/config': 'general-settings',
  account: '',
  '/settings/accounting/config/accounts': 'account',
  '/settings/accounting/config/account-categories': 'account-category-label',
  '/settings/accounting/config/permissions': 'account-permissions',
  tax: '',
  '/settings/accounting/config/vat-rows': 'vat-row-label',
  '/settings/accounting/config/ctax-rows': 'city-tax-row',
  sync: '',
  '/settings/accounting/config/sync-deal': 'deal-rule',
  '/settings/accounting/config/sync-deal-movement':
    'deal-inventory-movement-rule',
  '/settings/accounting/config/sync-deal-return': 'deal-return-rule',
  '/settings/accounting/config/sync-order': 'pos-order-rule-label',
};

export enum ACCOUNTING_SETTINGS_CODES {
  SYNC_DEAL = 'syncDeal',
  SYNC_DEAL_MOVEMENT = 'syncDealMovement',
  SYNC_DEAL_RETURN = 'syncDealReturn',
  SYNC_ORDER = 'syncOrder',
}
