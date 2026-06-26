export const SETTINGS_ROUTES = {
  '/settings/accounting/config': 'Ерөнхий тохиргоо',
  'account': '',
  '/settings/accounting/config/accounts': 'Данс',
  '/settings/accounting/config/account-categories': 'Дансны ангилал',
  '/settings/accounting/config/permissions': 'Дансны эрх',
  'tax': '',
  '/settings/accounting/config/vat-rows': 'НӨАТ-ын мөр',
  '/settings/accounting/config/ctax-rows': 'НХАТ-ын мөр',
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
