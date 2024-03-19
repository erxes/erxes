export interface IPolarisLoan {
  custCode: string;
  name: string;
  name2: string;
  prodCode: string;
  prodType: string;
  purpose: string;
  subPurpose: string;
  isNotAutoClass: number;
  comRevolving: number;
  dailyBasisCode: string;
  curCode: string;
  approvAmount: number;
  impairmentPer: number;
  approvDate: string;
  acntManager: number;
  brchCode: string;
  IsGetBrchFromOutside: string;
  segCode: string;
  status: string;
  slevel: string;
  classNoTrm: string;
  classNoQlt: string;
  classNo: string;
  startDate: string;
  endDate: string;
  termLen: 1;
  termBasis: string;
  isBrowseAcntOtherCom: number;
  repayPriority: number;
  useSpclAcnt: number;
  notSendToCib: number;
  losMultiAcnt: number;
  validLosAcnt: number;
  secType: number;
}

export interface IPolarisLoanGive {
  txnAcntCode: string;
  txnAmount: number;
  curCode: string;
  rate: number;
  contAcntCode: string;
  contAmount: number;
  contCurCode: string;
  contRate: number;
  rateTypeId: string;
  txnDesc: string;
  tcustName: string;
  tcustAddr: string;
  tcustRegister: string;
  tcustRegisterMask: string;
  tcustContact: string;
  sourceType: string;
  isTmw: number;
  isPreview: number;
  isPreviewFee: number;
  addParams: any;
}

export interface IPolarisStoreInterest {
  txnAcntCode: string;
  txnAmount: number;
  txnDesc: string;
  sourceType: string;
  offBal: number;
  isPreview: number;
  isTmw: number;
  intTypeCodeAdj: string;
}

export interface IPolarisClassification {
  operCode: string;
  txnAcntCode: string;
  newValue: string;
  txnDesc: string;
  sourceType: string;
  identityType: string;
}

export interface IPolarisRepayment {
  txnAcntCode: string;
  txnAmount: number;
  rate: number;
  rateTypeId: string;
  contAcntCode: string;
  contAmount: number;
  contRate: number;
  txnDesc: string;
  tcustRegister: string;
  tcustRegisterMask: string;
  sourceType: string;
  isPreview: number;
  isPreviewFee: any;
  isTmw: number;
}
