import { JournalEnum } from '@/settings/account/types/Account';

export const JOURNAL_LABELS = {
  [JournalEnum.MAIN]: 'general',
  [JournalEnum.TAX]: 'tax',
  [JournalEnum.BANK]: 'bank-label',
  [JournalEnum.CASH]: 'cash-label',
  [JournalEnum.DEBT]: 'payables-and-receivables',
  [JournalEnum.EXCHANGE_DIFF]: 'exchange-rate-difference',
  [JournalEnum.INVENTORY]: 'inventory-label',
  [JournalEnum.INV_FOLLOW]: 'related-inventory-entries',
  [JournalEnum.FIXED_ASSET]: 'fixed-assets',
  [JournalEnum.FXA_FOLLOW]: 'related-fixed-asset-entries',
};
