export const SETTINGS_ROUTES = {
  '/settings/accounting': 'Main settings',
  '/settings/accounting/accounts': 'Accounts',
  '/settings/accounting/account-categories': 'Account categories',
  '/settings/accounting/vat-rows': 'VAT Rows',
  '/settings/accounting/ctax-rows': 'CTAX Rows',
  '/settings/accounting/sync-deal': 'Sync Deal',
  '/settings/accounting/sync-deal-return': 'Sync Deal Return',
  '/settings/accounting/sync-order': 'Sync Order',
};

export enum ACCOUNTING_SETTINGS_CODES {
  SYNC_DEAL = 'syncDeal',
  SYNC_DEAL_RETURN = 'syncDealReturn',
  SYNC_ORDER = 'syncOrder',
}
