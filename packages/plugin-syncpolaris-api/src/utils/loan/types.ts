export interface PolarisLoan {
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

export interface PolarisLoanGive {
  txnAcntCode: '300116000030';
  txnAmount: 10000000;
  curCode: 'MNT';
  rate: 1;
  contAcntCode: '300021000078';
  contAmount: 10000000;
  contCurCode: 'MNT';
  contRate: 1;
  rateTypeId: '16';
  txnDesc: '10M zeel belen busaar olgov';
  tcustName: 'Ner';
  tcustAddr: 'hayag';
  tcustRegister: 'ЖЖ77885544';
  tcustRegisterMask: '3';
  tcustContact: '88774455';
  sourceType: 'TLLR';
  isTmw: 1;
  isPreview: 0;
  isPreviewFee: 0;
}
