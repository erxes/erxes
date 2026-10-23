export const SETTINGS_ROUTES = {
  '/accounting/settings/config': 'general-settings',
  account: '',
  '/accounting/settings/config/accounts': 'account',
  '/accounting/settings/config/account-categories': 'account-category-label',
  '/accounting/settings/config/permissions': 'account-permissions',
  tax: '',
  '/accounting/settings/config/vat-rows': 'vat-row-label',
  '/accounting/settings/config/ctax-rows': 'city-tax-row',
  sync: '',
  '/accounting/settings/config/sync-deal': 'deal-rule',
  '/accounting/settings/config/sync-deal-movement':
    'deal-inventory-movement-rule',
  '/accounting/settings/config/sync-deal-return': 'deal-return-rule',
  '/accounting/settings/config/sync-order': 'pos-order-rule-label',
};

export const INVENTORY_SETTINGS_ROUTES = {
  '/accounting/settings/inventories/jobs': 'job-production-stage',
  '/accounting/settings/inventories/job-outputs':
    'job-production-stage-outputs',
};

export enum ACCOUNTING_SETTINGS_CODES {
  SYNC_DEAL = 'syncDeal',
  SYNC_DEAL_MOVEMENT = 'syncDealMovement',
  SYNC_DEAL_RETURN = 'syncDealReturn',
  SYNC_ORDER = 'syncOrder',
}
