import { Document } from 'mongoose';

export interface ITdbConfig {
  name: string;
  description?: string;

  // TDB Corporate Gateway
  apiUrl: string;
  clientId: string;
  clientSecret: string;

  testMode?: boolean;
}

export interface ITdbConfigDocument extends ITdbConfig, Document {
  _id: string;
  createdAt: Date;
}

/**
 * OAuth
 */

export interface TdbTokenResponse {
  success: boolean;
  msg?: string;
  token: string;
}

/**
 * Accounts
 */

export interface TdbAccount {
  ACNTNO: string;
  IBAN?: string;
  iban?: string;
  ACNTNAME: string;
  ACNTMODE: string;
  CURCODE: string;
  BALANCE: number;
  CUSTNO: string;
  AVAILABLEBAL: number;
  HOLDBAL: number;
}

export interface TdbAccountsResponse {
  success: boolean;
  msg: string;
  data: TdbAccount[];
}

/**
 * Account balance
 */

export interface TdbBalanceResponse {
  success: boolean;
  msg: string;
  data: {
    invoice: TdbAccount;
  };
}

/**
 * Account statement
 */

export interface TdbStatementHeader {
  startbalance: number;
  total_credit: number;
  endbalance: number;
  total_debit: number;
  totalrecords: number;
}

export interface TdbStatementTransaction {
  txndate: string;
  refno: number;
  txndesc: string;
  credit: number;
  debit: number;
  balance: number;
  contacntno: string;
  currate: number;
  contacntname: string;
  fee: string;
  bankcode: string;
}

export interface TdbStatementResponse {
  success: boolean;
  msg: string;
  header: TdbStatementHeader[];
  txn: TdbStatementTransaction[];
}

/**
 * Domestic transfer
 */

export interface TdbDomesticTransferInput {
  debtorAccount: string;
  creditorAccount: string;
  txnAmount: number;
  txnDesc: string;
}

export interface TdbTransferResponse {
  success: boolean;
  requestid: number;
  transactionNumber: string;
  message: string;
}

/**
 * Interbank transfer
 */

export interface TdbInterbankTransferInput {
  debtorAccount: string;
  creditorAccount: string;
  creditorCurrency: string;
  creditorAccountName: string;
  beneficiaryBankCode: number;
  txnAmount: number;
  txnDesc: string;
}

/**
 * Bank
 */

export interface TdbBank {
  code: string;
  name: string;
}

/**
 * Orders / HPP
 */

export interface TdbOrderInput {
  typeRid?: string;
  amount: number;
  currency: string;
  description?: string;
  language?: string;
  hppRedirectUrl: string;
}

export interface TdbOrder {
  id: number;
  typeRid: string;
  amount: number;
  currency: string;
  description?: string;
  language?: string;
  hppRedirectUrl?: string;
  password?: string;
  status: string;
}

export interface TdbOrderCreateResponse {
  success: boolean;
  msg: string;
  order: TdbOrder;
}

export interface TdbOrderDetail {
  success: boolean;
  msg: string;
  order: TdbOrder;
}