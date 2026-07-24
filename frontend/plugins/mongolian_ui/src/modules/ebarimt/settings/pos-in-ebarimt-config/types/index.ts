import { z } from 'zod';
import {
  EBARIMT_COMMON_DEFAULT_VALUES,
  getEBarimtCommonFormValues,
} from '@/ebarimt/settings/types/EBarimtConfig';

export const normalizeRuleIds = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
};

export const addEBarimtPosInConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  posId: z.string().min(1, 'Pos is required'),
  ebarimtUrl: z.string().optional(),
  posNo: z.string().optional(),
  companyRD: z.string().optional(),
  merchantTin: z.string().optional(),
  branchOfProvince: z.string().optional(),
  subProvince: z.string().optional(),
  districtCode: z.string().optional(),
  companyName: z.string().optional(),
  defaultUnitedCode: z.string().optional(),
  headerText: z.string().optional(),
  branchNo: z.string().optional(),
  citytaxPercent: z.string().optional(),
  reverseVatRules: z.array(z.string()).optional(),
  hasVat: z.boolean(),
  vatPercent: z.string().optional(),
  hasCitytax: z.boolean().optional(),
  footerText: z.string().optional(),
  reverseCtaxRules: z.array(z.string()).optional(),
  withDescription: z.boolean().optional(),
  skipEbarimt: z.boolean().optional(),
});

export interface PosInEbarimtConfig {
  title: string;
  posId: string;
  ebarimtUrl?: string;
  posNo: string;
  companyRD: string;
  merchantTin: string;
  branchOfProvice: string;
  subProvice: string;
  districtCode: string;
  companyName: string;
  defaultUnitedCode: string;
  headerText: string;
  branchNo: string;
  hasVat: boolean;
  vatPercent: string;
  reverseVatRules?: string[];
  anotherRulesOfProductsOnVat: string;

  hasCitytax: boolean;
  footerText: string;
  citytaxPercent: string;
  reverseCtaxRules?: string[];
  anotherRulesOfProductsOnCitytax: string;
  withDescription: boolean;
  skipEbarimt: boolean;
}

export type TPosInEbarimtConfig = z.infer<typeof addEBarimtPosInConfigSchema>;

export const POS_IN_EBARIMT_DEFAULT_VALUES: TPosInEbarimtConfig = {
  ...EBARIMT_COMMON_DEFAULT_VALUES,
  posId: '',
  posNo: '10003424',
  ebarimtUrl: '',
};

export const getPosInEBarimtFormValues = (
  detail: Partial<TPosInEbarimtConfig>,
): TPosInEbarimtConfig => ({
  ...getEBarimtCommonFormValues(detail),
  posId: detail.posId || '',
  posNo: detail.posNo || '10003424',
  ebarimtUrl: detail.ebarimtUrl || '',
});
