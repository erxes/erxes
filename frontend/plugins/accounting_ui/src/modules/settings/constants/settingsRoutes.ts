export const SETTINGS_ROUTES = {
  '/settings/accounting': 'Ерөнхий тохиргоо',
  'account': '',
  '/settings/accounting/accounts': 'Данс',
  '/settings/accounting/account-categories': 'Дансны ангилал',
  '/settings/accounting/permissions': 'Дансны эрх',
  'tax': '',
  '/settings/accounting/vat-rows': 'НӨАТ-ын мөр',
  '/settings/accounting/ctax-rows': 'НХАТ-ын мөр',
  'sync': '',
  '/settings/accounting/sync-deal': 'Хэлцлийн дүрэм',
  '/settings/accounting/sync-deal-return': 'Хэлцлийн буцаалтын дүрэм',
  '/settings/accounting/sync-order': 'POS захиалгын дүрэм',
};

export enum ACCOUNTING_SETTINGS_CODES {
  SYNC_DEAL = 'syncDeal',
  SYNC_DEAL_RETURN = 'syncDealReturn',
  SYNC_ORDER = 'syncOrder',
}
