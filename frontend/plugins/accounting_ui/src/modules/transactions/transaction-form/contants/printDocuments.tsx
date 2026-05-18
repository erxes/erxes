import { TrJournalEnum } from '../../types/constants';
import { PrintBankDocument } from '../components/documents/bank';
import { TransactionDocument } from '../components/documents/TransactionDocument';

export const PRINT_DOCUMENTS = {
  [TrJournalEnum.MAIN]: TransactionDocument,
  [TrJournalEnum.TAX]: '',
  [TrJournalEnum.CASH]: TransactionDocument,
  [TrJournalEnum.BANK]: PrintBankDocument,
  [TrJournalEnum.RECEIVABLE]: TransactionDocument,
  [TrJournalEnum.PAYABLE]: TransactionDocument,
  [TrJournalEnum.EXCHANGE_DIFF]: '',

  [TrJournalEnum.INV_INCOME]: TransactionDocument,
  [TrJournalEnum.INV_OUT]: TransactionDocument,

  [TrJournalEnum.INV_MOVE]: TransactionDocument,
  [TrJournalEnum.INV_MOVE_IN]: '',

  [TrJournalEnum.INV_SALE]: TransactionDocument,
  [TrJournalEnum.INV_SALE_OUT]: '',
  [TrJournalEnum.INV_SALE_COST]: '',

  [TrJournalEnum.INV_SALE_RETURN]: TransactionDocument,
  [TrJournalEnum.INV_SALE_RETURN_OUT]: '',
  [TrJournalEnum.INV_SALE_RETURN_COST]: '',

  [TrJournalEnum.FIXED_ASSET]: '',
};
