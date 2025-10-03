import { CustomerType } from 'ui-modules';
import { TR_SIDES, TrJournalEnum } from '../../types/constants';
import { ITransaction, ITrDetail } from '../../types/Transaction';
import { getTempId } from '../components/utils';
import {
  TBankJournal,
  TCashJournal,
  TInvIncomeJournal,
  TInvMoveJournal,
  TInvOutJournal,
  TInvSaleJournal,
  TMainJournal,
  TPayableJournal,
  TReceivableJournal,
  TTaxJournal,
} from '../types/JournalForms';

const trDataWrapper = (doc?: ITransaction) => {
  return {
    ...doc,
    _id: doc?._id ?? getTempId(),
    customerType: doc?.customerType || CustomerType.CUSTOMER,
  }
}

const trDetailWrapper = (detail?: ITrDetail) => {
  return {
    ...(detail || {}),
    _id: detail?._id ?? getTempId(),
    account: detail?.account,
    accountId: detail?.accountId ?? '',
    side: (detail?.side || TR_SIDES.DEBIT),
    amount: detail?.amount ?? 0,
    checked: false
  }
}

export const DEFAULT_VAT_VALUES = (doc?: ITransaction) => {
  return {
    hasVat: doc?.hasVat ?? false,
    isHandleVat: doc?.isHandleVat ?? false,
    afterVat: doc?.afterVat ?? false,
    vatRowId: doc?.vatRowId,
  }
};

export const DEFAULT_CTAX_VALUES = (doc?: ITransaction) => {
  return {
    hasCtax: doc?.hasCtax ?? false,
    isHandleCtax: doc?.isHandleCtax ?? false,
    ctaxRowId: doc?.ctaxRowId,
  }
};

export const MAIN_JOURNAL_DEFAULT_VALUES = (doc?: ITransaction): Partial<TMainJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.MAIN,
    details: [{
      ...trDetailWrapper(doc?.details[0])
    }]
  };
}

export const CASH_JOURNAL_DEFAULT_VALUES = (doc?: ITransaction): Partial<TCashJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.CASH,
    ...DEFAULT_VAT_VALUES(doc),
    ...DEFAULT_CTAX_VALUES(doc),
    details: [{
      ...trDetailWrapper(doc?.details[0]),
    }]
  };
};

export const BANK_JOURNAL_DEFAULT_VALUES = (doc?: ITransaction): Partial<TBankJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.BANK,
    ...DEFAULT_VAT_VALUES(doc),
    ...DEFAULT_CTAX_VALUES(doc),
    details: [{
      ...trDetailWrapper(doc?.details[0]),
    }]
  }
};

export const RECEIVABLE_JOURNAL_DEFAULT_VALUES = (doc?: ITransaction): Partial<TReceivableJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.RECEIVABLE,
    ...DEFAULT_VAT_VALUES(doc),
    ...DEFAULT_CTAX_VALUES(doc),
    details: [{
      ...trDetailWrapper(doc?.details[0]),
    }]
  };
}

export const PAYABLE_JOURNAL_DEFAULT_VALUES = (doc?: ITransaction): Partial<TPayableJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.PAYABLE,
    ...DEFAULT_VAT_VALUES(doc),
    ...DEFAULT_CTAX_VALUES(doc),
    details: [{
      ...trDetailWrapper(doc?.details[0]),
    }]
  };
}

export const TAX_JOURNAL_DEFAULT_VALUES = (doc?: ITransaction): Partial<TTaxJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.TAX,
    details: [{
      ...trDetailWrapper(doc?.details[0]),
    }]
  }
};

export const INV_INCOME_JOURNAL_DEFAULT_VALUES = (doc?: ITransaction): Partial<TInvIncomeJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.INV_INCOME,
    ...DEFAULT_VAT_VALUES(doc),
    ...DEFAULT_CTAX_VALUES(doc),
    details: !doc?.details.length ? [{
      ...trDetailWrapper(),
      side: TR_SIDES.DEBIT,
      productId: '',
      count: 0,
      unitPrice: 0,
      amount: 0,
    }] : doc?.details.map(det => ({
      ...trDetailWrapper(det),
      side: TR_SIDES.DEBIT,
      productId: det.productId || '',
      product: det.product,
      count: det.count ?? 0,
      unitPrice: det.unitPrice ?? 0,
      amount: det.amount ?? 0,
    }))
  }
};

export const INV_OUT_JOURNAL_DEFAULT_VALUES = (doc?: ITransaction): Partial<TInvOutJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.INV_OUT,
    details: !doc?.details.length ? [{
      ...trDetailWrapper(),
      side: TR_SIDES.CREDIT,
      productId: '',
      count: 0,
      unitPrice: 0,
      amount: 0,
    }] : doc?.details.map(det => ({
      ...trDetailWrapper(det),
      side: TR_SIDES.CREDIT,
      productId: det.productId || '',
      product: det.product,
      count: det.count ?? 0,
      unitPrice: det.unitPrice ?? 0,
      amount: det.amount ?? 0,
    }))
  }
};

export const INV_MOVE_JOURNAL_DEFAULT_VALUES = (doc?: ITransaction): Partial<TInvMoveJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.INV_MOVE,
    details: !doc?.details.length ? [{
      ...trDetailWrapper(),
      side: TR_SIDES.CREDIT,
      productId: '',
      count: 0,
      unitPrice: 0,
      amount: 0,
    }] : doc?.details.map(det => ({
      ...trDetailWrapper(det),
      side: TR_SIDES.CREDIT,
      productId: det.productId || '',
      product: det.product,
      count: det.count ?? 0,
      unitPrice: det.unitPrice ?? 0,
      amount: det.amount ?? 0,
    }))
  }
};

export const INV_SALE_JOURNAL_DEFAULT_VALUES = (doc?: ITransaction): Partial<TInvSaleJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.INV_SALE,
    details: !doc?.details.length ? [{
      ...trDetailWrapper(),
      side: TR_SIDES.CREDIT,
      productId: '',
      count: 0,
      unitPrice: 0,
      amount: 0,
    }] : doc?.details.map(det => ({
      ...trDetailWrapper(det),
      side: TR_SIDES.CREDIT,
      productId: det.productId || '',
      product: det.product,
      count: det.count ?? 0,
      unitPrice: det.unitPrice ?? 0,
      amount: det.amount ?? 0,
    }))
  }
};

export const JOURNALS_BY_JOURNAL = (journal: string, doc?: ITransaction | any) => {
  if (!doc) {
    doc = {
      details: [] as ITrDetail[]
    } as ITransaction
  }

  if (!doc?._id) {
    doc._id = getTempId();
  }

  switch (journal) {
    case TrJournalEnum.CASH:
      return CASH_JOURNAL_DEFAULT_VALUES(doc);

    case TrJournalEnum.BANK:
      return BANK_JOURNAL_DEFAULT_VALUES(doc);

    case TrJournalEnum.RECEIVABLE:
      return RECEIVABLE_JOURNAL_DEFAULT_VALUES(doc);

    case TrJournalEnum.PAYABLE:
      return PAYABLE_JOURNAL_DEFAULT_VALUES(doc);

    case TrJournalEnum.INV_INCOME:
      return INV_INCOME_JOURNAL_DEFAULT_VALUES(doc);

    case TrJournalEnum.INV_OUT:
      return INV_OUT_JOURNAL_DEFAULT_VALUES(doc);

    case TrJournalEnum.INV_MOVE:
      return INV_MOVE_JOURNAL_DEFAULT_VALUES(doc);

    case TrJournalEnum.INV_SALE:
      return INV_SALE_JOURNAL_DEFAULT_VALUES(doc);

    default: // MAIN
      return MAIN_JOURNAL_DEFAULT_VALUES(doc);
  }
};
