import { atom } from 'jotai';

export interface IPosInEbarimtConfigRow {
  _id: string;
  subId: string;
  title: string;
  posId: string;
  posNo?: string;
  companyName?: string;
  companyRD?: string;
  merchantTin?: string;
  branchOfProvince?: string;
  subProvince?: string;
  districtCode?: string;
  defaultUnitedCode?: string;
  branchNo?: string;
  hasVat?: boolean;
  vatPercent?: string;
  reverseVatRules?: string;
  hasCitytax?: boolean;
  citytaxPercent?: string;
  reverseCtaxRules?: string;
  headerText?: string;
  footerText?: string;
  withDescription?: boolean;
  skipEbarimt?: boolean;
  ebarimtUrl?: string;
}

export const posInEbarimtDetailAtom = atom<IPosInEbarimtConfigRow | null>(null);
