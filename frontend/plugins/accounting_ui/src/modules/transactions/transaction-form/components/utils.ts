import { nanoid } from 'nanoid';
import { AccountKind, JournalEnum } from '@/settings/account/types/Account';
import { TrJournalEnum } from '../../types/constants';
export const getTempId = () => {
  return nanoid();
};

export const getTrSide = (
  mainSide?: 'dt' | 'ct' | string,
  isInverse?: boolean,
) => {
  if (isInverse) {
    if (mainSide === 'dt') {
      return 'ct';
    }
    return 'dt';
  }

  return mainSide || 'dt';
};

export const getSingleJournalByAccount = (
  accJournal?: string,
  accKind?: string,
) => {
  switch (accJournal) {
    case JournalEnum.BANK:
      return TrJournalEnum.BANK;
    case JournalEnum.CASH:
      return TrJournalEnum.CASH;
    case JournalEnum.DEBT:
      if (accKind === AccountKind.ACTIVE) {
        return TrJournalEnum.RECEIVABLE;
      } else {
        return TrJournalEnum.PAYABLE;
      }
    case JournalEnum.TAX:
      return TrJournalEnum.TAX;
    case JournalEnum.MAIN:
    default:
      return TrJournalEnum.MAIN;
  }
};
