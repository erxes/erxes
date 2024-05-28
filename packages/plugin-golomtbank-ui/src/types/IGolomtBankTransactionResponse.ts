export interface IResponseHeader {
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
export interface ITransactionIdentifier {
  creditTransactionId: number,
  status: boolean,
  debitTransactionAccount: string,
  creditTransactionAccount: string,
  transactionDate: Date,
  transactionId: string,
  error: string
}