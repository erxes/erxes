import { JournalEnum } from '@/settings/account/types/Account';

export const JOURNAL_LABELS = {
  [JournalEnum.MAIN]: 'Main',
  [JournalEnum.TAX]: 'Tax',
  [JournalEnum.BANK]: 'Bank',
  [JournalEnum.CASH]: 'Cash',
  [JournalEnum.DEBT]: 'Debt',
  [JournalEnum.EXCHANGE_DIFF]: 'Exchange diff',
  [JournalEnum.INVENTORY]: 'Inventory',
  [JournalEnum.INV_FOLLOW]: 'Inventory Follow',
  [JournalEnum.FIXED_ASSET]: 'Fixed Asset',
};
