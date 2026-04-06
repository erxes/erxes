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
  TInvSaleReturnJournal,
  TMainJournal,
  TPayableJournal,
  TReceivableJournal,
  TTaxJournal,
  TTrDoc,
} from '../types/JournalForms';

const trDataWrapper = (doc?: Partial<ITransaction>) => {
  return {
    ...doc,
    _id: doc?._id ?? getTempId(),
    customerType: doc?.customerType || CustomerType.CUSTOMER,
  };
};

const trDetailWrapper = (detail?: ITrDetail) => {
  return {
    ...(detail || {}),
    _id: detail?._id ?? getTempId(),
    account: detail?.account,
    accountId: detail?.accountId ?? '',
    side: detail?.side || TR_SIDES.DEBIT,
    amount: detail?.amount ?? 0,
    checked: false,
  };
};

export const DEFAULT_VAT_VALUES = (doc?: Partial<ITransaction>) => {
  return {
    hasVat: doc?.hasVat ?? false,
    isHandleVat: doc?.isHandleVat ?? false,
    afterVat: doc?.afterVat ?? false,
    vatRowId: doc?.vatRowId,
  };
};

export const DEFAULT_CTAX_VALUES = (doc?: Partial<ITransaction>) => {
  return {
    hasCtax: doc?.hasCtax ?? false,
    isHandleCtax: doc?.isHandleCtax ?? false,
    ctaxRowId: doc?.ctaxRowId,
  };
};

export const MAIN_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TMainJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.MAIN,
    details: [
      {
        ...trDetailWrapper(doc?.details?.[0]),
      },
    ],
  };
};

export const CASH_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TCashJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.CASH,
    ...DEFAULT_VAT_VALUES(doc),
    ...DEFAULT_CTAX_VALUES(doc),
    details: [
      {
        ...trDetailWrapper(doc?.details?.[0]),
      },
    ],
  };
};

export const BANK_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TBankJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.BANK,
    ...DEFAULT_VAT_VALUES(doc),
    ...DEFAULT_CTAX_VALUES(doc),
    details: [
      {
        ...trDetailWrapper(doc?.details?.[0]),
      },
    ],
  };
};

export const RECEIVABLE_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TReceivableJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.RECEIVABLE,
    ...DEFAULT_VAT_VALUES(doc),
    ...DEFAULT_CTAX_VALUES(doc),
    details: [
      {
        ...trDetailWrapper(doc?.details?.[0]),
      },
    ],
  };
};

export const PAYABLE_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TPayableJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.PAYABLE,
    ...DEFAULT_VAT_VALUES(doc),
    ...DEFAULT_CTAX_VALUES(doc),
    details: [
      {
        ...trDetailWrapper(doc?.details?.[0]),
      },
    ],
  };
};

export const TAX_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TTaxJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.TAX,
    details: [
      {
        ...trDetailWrapper(doc?.details?.[0]),
      },
    ],
  };
};

export const INV_INCOME_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TInvIncomeJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.INV_INCOME,
    ...DEFAULT_VAT_VALUES(doc),
    ...DEFAULT_CTAX_VALUES(doc),
    details: !doc?.details?.length
      ? [
        {
          ...trDetailWrapper(),
          side: TR_SIDES.DEBIT,
          productId: '',
          count: 0,
          unitPrice: 0,
          amount: 0,
        },
      ]
      : doc?.details.map((det) => ({
        ...trDetailWrapper(det),
        side: TR_SIDES.DEBIT,
        productId: det.productId || '',
        product: det.product,
        count: det.count ?? 0,
        unitPrice: det.unitPrice ?? 0,
        amount: det.amount ?? 0,
      })),
  };
};

export const INV_OUT_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TInvOutJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.INV_OUT,
    details: !doc?.details?.length
      ? [
        {
          ...trDetailWrapper(),
          side: TR_SIDES.CREDIT,
          productId: '',
          count: 0,
          unitPrice: 0,
          amount: 0,
        },
      ]
      : doc?.details.map((det) => ({
        ...trDetailWrapper(det),
        side: TR_SIDES.CREDIT,
        productId: det.productId || '',
        product: det.product,
        count: det.count ?? 0,
        unitPrice: det.unitPrice ?? 0,
        amount: det.amount ?? 0,
      })),
  };
};

export const INV_MOVE_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TInvMoveJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.INV_MOVE,
    details: !doc?.details?.length
      ? [
        {
          ...trDetailWrapper(),
          side: TR_SIDES.CREDIT,
          productId: '',
          count: 0,
          unitPrice: 0,
          amount: 0,
        },
      ]
      : doc?.details.map((det) => ({
        ...trDetailWrapper(det),
        side: TR_SIDES.CREDIT,
        productId: det.productId || '',
        product: det.product,
        count: det.count ?? 0,
        unitPrice: det.unitPrice ?? 0,
        amount: det.amount ?? 0,
      })),
  };
};

export const INV_SALE_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TInvSaleJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.INV_SALE,
    details: !doc?.details?.length
      ? [
        {
          ...trDetailWrapper(),
          side: TR_SIDES.CREDIT,
          productId: '',
          count: 0,
          unitPrice: 0,
          amount: 0,
        },
      ]
      : doc?.details.map((det) => ({
        ...trDetailWrapper(det),
        side: TR_SIDES.CREDIT,
        productId: det.productId || '',
        product: det.product,
        count: det.count ?? 0,
        unitPrice: det.unitPrice ?? 0,
        amount: det.amount ?? 0,
      })),
  };
};

export const INV_SALE_RETURN_JOURNAL_DEFAULT_VALUES = (
  doc?: Partial<ITransaction>,
): Partial<TInvSaleReturnJournal> => {
  return {
    ...trDataWrapper(doc),
    journal: TrJournalEnum.INV_SALE_RETURN,
    details: doc?.details?.length
      ? doc?.details.map((det) => ({
        ...trDetailWrapper(det),
        side: TR_SIDES.DEBIT,
        productId: det.productId || '',
        product: det.product,
        count: det.count ?? 0,
        unitPrice: det.unitPrice ?? 0,
        amount: det.amount ?? 0,
      }))
      : [
        {
          ...trDetailWrapper(),
          side: TR_SIDES.DEBIT,
          productId: '',
          count: 0,
          unitPrice: 0,
          amount: 0,
        },
      ],
  };
};

export const JOURNALS_BY_JOURNAL = (
  journal: string,
  doc?: Partial<ITransaction>,
): TTrDoc => {
  if (!doc) {
    doc = {
      details: [] as ITrDetail[],
    } as ITransaction;
  }

  if (!doc?._id) {
    doc._id = getTempId();
  }

  let result;

  switch (journal) {
    case TrJournalEnum.CASH:
      result = CASH_JOURNAL_DEFAULT_VALUES(doc);
      break;

    case TrJournalEnum.BANK:
      result = BANK_JOURNAL_DEFAULT_VALUES(doc);
      break;

    case TrJournalEnum.RECEIVABLE:
      result = RECEIVABLE_JOURNAL_DEFAULT_VALUES(doc);
      break;

    case TrJournalEnum.PAYABLE:
      result = PAYABLE_JOURNAL_DEFAULT_VALUES(doc);
      break;

    case TrJournalEnum.INV_INCOME:
      result = INV_INCOME_JOURNAL_DEFAULT_VALUES(doc);
      break;

    case TrJournalEnum.INV_OUT:
      result = INV_OUT_JOURNAL_DEFAULT_VALUES(doc);
      break;

    case TrJournalEnum.INV_MOVE:
      result = INV_MOVE_JOURNAL_DEFAULT_VALUES(doc);
      break;

    case TrJournalEnum.INV_SALE:
      result = INV_SALE_JOURNAL_DEFAULT_VALUES(doc);
      break;

    case TrJournalEnum.INV_SALE_RETURN:
      result = INV_SALE_RETURN_JOURNAL_DEFAULT_VALUES(doc);
      break;

    default: // MAIN
      result = MAIN_JOURNAL_DEFAULT_VALUES(doc);
      break;
  }
  return result as TTrDoc
};
