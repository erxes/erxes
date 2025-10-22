import { nanoid } from 'nanoid';
import { AccountKind, JournalEnum } from '@/settings/account/types/Account';
import { TR_SIDES, TrJournalEnum } from '../../types/constants';
import { ITransaction } from '../../types/Transaction';
import { TAddTransactionGroup } from '../types/JournalForms';

export const getTempId = () => {
  return nanoid();
};

export const getSumDtCt = (tr: ITransaction) => {
  let sumDt = 0;
  let sumCt = 0;

  tr.details.forEach((detail) => {
    if (detail.side === TR_SIDES.DEBIT) {
      sumDt += detail?.amount ?? 0;
    } else {
      sumCt += detail?.amount ?? 0;
    }
  });

  return { sumDt, sumCt }
}

export const fixSumDtCt = (tr: ITransaction) => {
  if (!tr.details?.length) {
    return { ...tr, sumDt: 0, sumCt: 0 }
  }
  const { sumDt, sumCt } = getSumDtCt(tr);
  return { ...tr, sumDt, sumCt }
}

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

export const cleanTrDoc = (trDoc: ITransaction) => {
  return {
    ...trDoc,
    details: trDoc.details.map(det => ({
      ...det,
      account: undefined,
      checked: undefined,
    })),
  }
}

export const cleanTrDocs = (data: TAddTransactionGroup) => {
  return data.trDocs.map(trD => cleanTrDoc({
    ...trD,
    followExtras: undefined,
    details: trD.details.map(det => ({
      ...det,
      account: undefined,
      checked: undefined,
    })),
    date: data.date,
    number: data.number,
  }));
}
