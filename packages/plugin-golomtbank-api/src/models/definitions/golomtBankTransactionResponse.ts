import { field } from '@erxes/api-utils/src/definitions/utils';
import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper } from './utils';

export interface responseHeader {
  msgId: string,
  CreDtTm: Date,
  TxsCd: number,
  NbOfTxs: number,
  CtrlSum: number,
  InitgPty: string,
  Id: string,
  OrgId:string,
  AnyBIC: string,
  Status: string,

}
export interface transactionIdentifier {
  creditTransactionId: number,
  status: boolean,
  debitTransactionAccount: string,
  creditTransactionAccount: string,
  transactionDate: Date,
  transactionId: string,
  error: string
}

export const golomtBankTransationSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    responseHeader: {
      msgId: String,
      CreDtTm: Date,
      TxsCd: Number,
      NbOfTxs: Number,
      CtrlSum: Number,
      InitgPty: String,
      Id: String,
      OrgId: String,
      AnyBIC: String,
      Status: String
    },
    transactionIdentifier:{
      creditTransactionId: Number,
      status: Boolean,
      debitTransactionAccount: String,
      creditTransactionAccount: String,
      transactionDate: Date,
      transactionId: String,
      error: String
    }
  }),
  'erxes_golomtBankTransationSchema'
) ;
