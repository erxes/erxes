
export interface IEbarimtConfig {
  companyName: string;
  ebarimtUrl: string;
  checkTaxpayerUrl: string;

  merchantTin: string;
  companyRD: string,
  districtCode: string;
  posNo: string;
  branchNo: string;

  hasVat: true,
  hasCitytax: false,
  defaultGSCode: string,
  vatPercent: number,
  cityTaxPercent: number,
  skipPutData: false,

  reverseVatRules?: string[];
  reverseCtaxRules?: string[];
}
