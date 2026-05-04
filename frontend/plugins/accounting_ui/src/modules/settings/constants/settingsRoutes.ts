export const SETTINGS_ROUTES = {
  '/settings/accounting': 'Үндсэн тохиргоо',
  '/settings/accounting/accounts': 'Данс',
  '/settings/accounting/account-categories': 'Дансны ангилал',
  '/settings/accounting/vat-rows': 'НӨАТ-ын мөр',
  '/settings/accounting/ctax-rows': 'НХАТ-ын мөр',
  '/settings/accounting/sync-deal': 'Deal синк',
  '/settings/accounting/sync-deal-return': 'Deal буцаалтын синк',
  '/settings/accounting/sync-order': 'Захиалгын синк',
};

export enum ACCOUNTING_SETTINGS_CODES {
  SYNC_DEAL = 'syncDeal',
  SYNC_DEAL_RETURN = 'syncDealReturn',
  SYNC_ORDER = 'syncOrder',
}
