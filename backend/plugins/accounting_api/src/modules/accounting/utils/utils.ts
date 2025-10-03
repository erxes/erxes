import { ACCOUNT_JOURNALS, JOURNALS, ACCOUNT_KINDS } from '@/accounting/@types/constants';

export const getSingleJournalByAccount = (accJournal?: string, accKind?: string) => {

  switch (accJournal) {
    case ACCOUNT_JOURNALS.BANK:
      return JOURNALS.BANK;
    case ACCOUNT_JOURNALS.CASH:
      return JOURNALS.CASH;
    case ACCOUNT_JOURNALS.DEBT:
      if (accKind === ACCOUNT_KINDS.ACTIVE) {
        return JOURNALS.RECEIVABLE;
      } else {
        return JOURNALS.PAYABLE;
      }
    case ACCOUNT_JOURNALS.TAX:
      return JOURNALS.TAX;
    case ACCOUNT_JOURNALS.MAIN:
    default:
      return JOURNALS.MAIN;
  }
}
