import { TrJournalEnum } from '../../types/constants';
import { PrintBankDocument } from '../components/documents/bank';
import { PrintCashDocument } from '../components/documents/cash';
import { PrintInvIncomeDocument } from '../components/documents/invIncome';
import { PrintInvMoveDocument } from '../components/documents/invMove';
import { PrintInvOutDocument } from '../components/documents/invOut';
import { PrintInvSaleDocument } from '../components/documents/invSale';
import { PrintInvSaleReturnDocument } from '../components/documents/invSaleReturn';
import { PrintInvoiceDocument } from '../components/documents/invoice';
import { TransactionDocument } from '../components/documents/TransactionDocument';

export const PRINT_DOCUMENTS = {
  [TrJournalEnum.MAIN]: TransactionDocument,
  [TrJournalEnum.TAX]: '',
  [TrJournalEnum.CASH]: PrintCashDocument,
  [TrJournalEnum.BANK]: PrintBankDocument,
  [TrJournalEnum.RECEIVABLE]: PrintInvoiceDocument,
  [TrJournalEnum.PAYABLE]: TransactionDocument,
  [TrJournalEnum.EXCHANGE_DIFF]: '',

  [TrJournalEnum.INV_INCOME]: PrintInvIncomeDocument,
  [TrJournalEnum.INV_OUT]: PrintInvOutDocument,

  [TrJournalEnum.INV_MOVE]: PrintInvMoveDocument,
  [TrJournalEnum.INV_MOVE_IN]: '',

  [TrJournalEnum.INV_SALE]: PrintInvSaleDocument,
  [TrJournalEnum.INV_SALE_OUT]: '',
  [TrJournalEnum.INV_SALE_COST]: '',

  [TrJournalEnum.INV_SALE_RETURN]: PrintInvSaleReturnDocument,
  [TrJournalEnum.INV_SALE_RETURN_OUT]: '',
  [TrJournalEnum.INV_SALE_RETURN_COST]: '',

  [TrJournalEnum.FIXED_ASSET]: '',
};
