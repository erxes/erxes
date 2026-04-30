import { JournalEnum } from '@/settings/account/types/Account';

export const JOURNAL_LABELS = {
  [JournalEnum.MAIN]: 'Ерөнхий',
  [JournalEnum.TAX]: 'Татвар',
  [JournalEnum.BANK]: 'Банк',
  [JournalEnum.CASH]: 'Касс',
  [JournalEnum.DEBT]: 'Өр, авлага',
  [JournalEnum.EXCHANGE_DIFF]: 'Ханшийн зөрүү',
  [JournalEnum.INVENTORY]: 'Бараа материал',
  [JournalEnum.INV_FOLLOW]: 'Бараа материал дагалдах',
  [JournalEnum.FIXED_ASSET]: 'Үндсэн хөрөнгө',
};
