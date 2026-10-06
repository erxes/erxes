import { JournalEnum } from '@/settings/account/types/Account';

export const JOURNAL_LABELS = {
  [JournalEnum.MAIN]: 'general',
  [JournalEnum.TAX]: 'tax',
  [JournalEnum.BANK]: 'bank',
  [JournalEnum.CASH]: 'cash',
  [JournalEnum.DEBT]: 'receivables-and-payables',
  [JournalEnum.EXCHANGE_DIFF]: 'exchange-rate-difference',
  [JournalEnum.INVENTORY]: 'inventory',
  [JournalEnum.INV_FOLLOW]: 'related-inventory-journal',
  [JournalEnum.FIXED_ASSET]: 'fixed-asset',
  [JournalEnum.FXA_FOLLOW]: 'related-fixed-asset-journal',
};
