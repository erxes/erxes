import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import {
  fxaDetailSchema,
  fxaIncomeDetailSchema,
  invDetailSchema,
  transactionBankSchema,
  transactionCashSchema,
  transactionFxaIncomeSchema,
  transactionFxaMoveSchema,
  transactionFxaOutSchema,
  transactionFxaSaleSchema,
  transactionGroupSchema,
  transactionInvIncomeSchema,
  transactionInvJustifySchema,
  transactionInvMoveSchema,
  transactionInvOutSchema,
  transactionInvSaleReturnSchema,
  transactionInvSaleSchema,
  transactionMainSchema,
  transactionPayableSchema,
  transactionReceivableSchema,
  transactionTaxSchema,
  trDocSchema,
} from '../contants/transactionSchema';

export type TAddTransactionGroup = z.infer<
  ReturnType<typeof transactionGroupSchema>
>;
export type TTrDoc = z.infer<ReturnType<typeof trDocSchema>>;

export type TMainJournal = z.infer<ReturnType<typeof transactionMainSchema>>;
export type TCashJournal = z.infer<ReturnType<typeof transactionCashSchema>>;
export type TBankJournal = z.infer<ReturnType<typeof transactionBankSchema>>;
export type TReceivableJournal = z.infer<
  ReturnType<typeof transactionReceivableSchema>
>;
export type TPayableJournal = z.infer<
  ReturnType<typeof transactionPayableSchema>
>;
export type TTaxJournal = z.infer<ReturnType<typeof transactionTaxSchema>>;

export type TInvIncomeJournal = z.infer<
  ReturnType<typeof transactionInvIncomeSchema>
>;
export type TInvOutJournal = z.infer<
  ReturnType<typeof transactionInvOutSchema>
>;
export type TInvJustifyJournal = z.infer<
  ReturnType<typeof transactionInvJustifySchema>
>;
export type TInvMoveJournal = z.infer<
  ReturnType<typeof transactionInvMoveSchema>
>;
export type TInvSaleJournal = z.infer<
  ReturnType<typeof transactionInvSaleSchema>
>;
export type TInvSaleReturnJournal = z.infer<
  ReturnType<typeof transactionInvSaleReturnSchema>
>;
export type TInvDetail = z.infer<ReturnType<typeof invDetailSchema>>;

export type TFxaIncomeJournal = z.infer<
  ReturnType<typeof transactionFxaIncomeSchema>
>;
export type TFxaOutJournal = z.infer<
  ReturnType<typeof transactionFxaOutSchema>
>;
export type TFxaMoveJournal = z.infer<
  ReturnType<typeof transactionFxaMoveSchema>
>;
export type TFxaSaleJournal = z.infer<
  ReturnType<typeof transactionFxaSaleSchema>
>;
export type TFxaDetail = z.infer<ReturnType<typeof fxaDetailSchema>>;
export type TFxaIncomeDetail = z.infer<
  ReturnType<typeof fxaIncomeDetailSchema>
>;

export type ITransactionGroupForm = UseFormReturn<TAddTransactionGroup>;

export interface ICommonFieldProps {
  form: ITransactionGroupForm;
  index: number;
  detIndex?: number;
  labelTxt?: string;
}
