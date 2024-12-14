
export interface IEbarimtConfig {
  companyName: string;
  ebarimtUrl: string;
  checkTaxpayerUrl: string;

  merchantTin: string;
  companyRD: string,
  districtCode: string;
  posNo: string;
  branchNo: string;

  hasVat: boolean,
  hasCitytax: boolean,
  defaultGSCode: string,
  vatPercent: number,
  cityTaxPercent: number,
  skipPutData: boolean,

  reverseVatRules?: string[];
  reverseCtaxRules?: string[];
}
