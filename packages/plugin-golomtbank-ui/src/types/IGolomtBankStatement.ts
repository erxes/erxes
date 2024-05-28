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

export interface IGolomtBankStatement {
header: IGroupHeader,
accountNumber: number,
currency: number,
fromDate: number, 
toDate: string,
journalNumber: string,
startNumber: IDebtorAccount,
endNumber:[ICreditInformation]
}

export interface IGolomtBankStatementDocument extends IGolomtBankStatement {
  _id: string;
  createdAt: Date;
  createdBy: string
}