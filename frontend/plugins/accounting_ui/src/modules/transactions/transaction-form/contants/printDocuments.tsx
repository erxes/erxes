import { TrJournalEnum } from "../../types/constants";
import { PrintBankDocument } from "../components/documents/bank";

export const PRINT_DOCUMENTS = {
  [TrJournalEnum.MAIN]: '',
  [TrJournalEnum.TAX]: '',
  [TrJournalEnum.CASH]: '',
  [TrJournalEnum.BANK]: PrintBankDocument,
  [TrJournalEnum.RECEIVABLE]: '',
  [TrJournalEnum.PAYABLE]: '',
  [TrJournalEnum.EXCHANGE_DIFF]: '',

  [TrJournalEnum.INV_INCOME]: '',
  [TrJournalEnum.INV_OUT]: '',

  [TrJournalEnum.INV_MOVE]: '',
  [TrJournalEnum.INV_MOVE_IN]: '',

  [TrJournalEnum.INV_SALE]: '',
  [TrJournalEnum.INV_SALE_OUT]: '',
  [TrJournalEnum.INV_SALE_COST]: '',

  [TrJournalEnum.INV_SALE_RETURN]: '',
  [TrJournalEnum.INV_SALE_RETURN_OUT]: '',
  [TrJournalEnum.INV_SALE_RETURN_COST]: '',

  [TrJournalEnum.FIXED_ASSET]: '',
};