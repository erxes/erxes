import { field } from '@erxes/api-utils/src/definitions/utils';
import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper } from './utils';
export interface IDebtorAccount {
  id: string,
  currency: string
}

export interface IGroupHeader {
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
export interface IAmount {
  instructedAmount: number,
  instructedCurrency: string
}

export interface ICreditorAccount {
  id: string,
  currency: string,
}
export interface ICreditInformation {
  creditTransferId: string,
  amount: IAmount,
  creditorName:  string,
  creditorAccount: ICreditorAccount,
  creditorAgentBICFI: string,
  RemittanceInformation: string,
  DealerRefNum: string,
  ExchangeRate: string 
}

export interface IGolomtBankTransation {
header: IGroupHeader,
transactionCode: number,
numberTransactions: number,
controlSum: number, 
forT: string,
debitorName: string,
debtorAccount: IDebtorAccount,
creditInformation:[ICreditInformation]
}

export interface IGolomtBankTransationDocument extends IGolomtBankTransation, Document {
  _id: string;
  createdAt: Date;
  createdBy: string
}

export const golomtBankTransationSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    header: {
    msgId: String,
    CreDtTm: Date,
    TxsCd: Number,
    NbOfTxs: Number,
    CtrlSum: Number,
    InitgPty: String,
    Id: String,
    OrgId:String,
    AnyBIC: String,
    Status: String,
    },
    transactionCode: Number,
    numberTransactions: Number,
    controlSum: Number, 
    forT: String,
    debitorName: String,
    debtorAccount: {
      id: String,
      currency: String
    },
    creditInformation: {
      creditTransferId: String,
      amount: {
        instructedAmount: Number,
        instructedCurrency: String
      },
      creditorName:  String,
      creditorAccount: {
        id: String,
        currency: String,
      },
      creditorAgentBICFI: String,
      RemittanceInformation: String,
      DealerRefNum: String,
      ExchangeRate: String 
    }
  }), 'erxes_golomtBankTransationSchema'
) 

