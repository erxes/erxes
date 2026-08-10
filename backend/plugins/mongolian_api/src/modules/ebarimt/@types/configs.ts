export interface IEbarimtConfig {
  companyName: string;
  ebarimtUrl: string;
  checkTaxpayerUrl: string;

  merchantTin: string;
  companyRD: string;
  districtCode: string;
  posNo: string;
  branchNo: string;

  hasVat: boolean;
  hasCitytax: boolean;
  defaultUnitedCode: string;
  vatPercent: number;
  cityTaxPercent: number;
  skipEbarimt: boolean;
  sendEmail?: boolean;

  reverseVatRules?: string[];
  reverseCtaxRules?: string[];
}
