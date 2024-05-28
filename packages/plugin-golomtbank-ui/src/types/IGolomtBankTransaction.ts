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
  OrgId: string,
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
  creditorName: string,
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
  creditInformation: [ICreditInformation]
}

export interface IGolomtBankTransationDocument extends IGolomtBankTransation {
  _id: string;
  createdAt: Date;
  createdBy: string
}