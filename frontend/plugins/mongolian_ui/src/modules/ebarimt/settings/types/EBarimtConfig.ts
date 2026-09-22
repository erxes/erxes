export interface TEBarimtCommonFormValues {
  branchNo: string;
  branchOfProvince: string;
  citytaxPercent: string;
  companyName: string;
  companyRD: string;
  defaultUnitedCode: string;
  districtCode: string;
  footerText: string;
  hasCitytax: boolean;
  hasVat: boolean;
  headerText: string;
  merchantTin: string;
  posNo: string;
  reverseCtaxRules: string[];
  reverseVatRules: string[];
  skipEbarimt: boolean;
  subProvince: string;
  title: string;
  vatPercent: string;
  withDescription: boolean;
}

export const EBARIMT_COMMON_DEFAULT_VALUES: TEBarimtCommonFormValues = {
  title: '',
  posNo: '',
  companyName: '',
  companyRD: '',
  merchantTin: '',
  branchOfProvince: '',
  subProvince: '',
  districtCode: '',
  defaultUnitedCode: '',
  branchNo: '',
  hasVat: false,
  vatPercent: '',
  reverseVatRules: [],
  hasCitytax: false,
  citytaxPercent: '',
  reverseCtaxRules: [],
  headerText: '',
  footerText: '',
  withDescription: false,
  skipEbarimt: false,
};

export const getEBarimtCommonFormValues = (
  detail: Partial<TEBarimtCommonFormValues>,
): TEBarimtCommonFormValues => ({
  title: detail.title || '',
  posNo: detail.posNo || '',
  companyName: detail.companyName || '',
  companyRD: detail.companyRD || '',
  merchantTin: detail.merchantTin || '',
  branchOfProvince: detail.branchOfProvince || '',
  subProvince: detail.subProvince || '',
  districtCode: detail.districtCode || '',
  defaultUnitedCode: detail.defaultUnitedCode || '',
  branchNo: detail.branchNo || '',
  hasVat: detail.hasVat || false,
  vatPercent: detail.vatPercent || '',
  reverseVatRules: normalizeRuleIds(detail.reverseVatRules),
  hasCitytax: detail.hasCitytax || false,
  citytaxPercent: detail.citytaxPercent || '',
  reverseCtaxRules: normalizeRuleIds(detail.reverseCtaxRules),
  headerText: detail.headerText || '',
  footerText: detail.footerText || '',
  withDescription: detail.withDescription || false,
  skipEbarimt: detail.skipEbarimt || false,
});

const normalizeRuleIds = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
};
