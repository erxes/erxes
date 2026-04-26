import { z } from 'zod';

export const addEBarimtPosInConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  posId: z.string().min(1, 'Pos is required'),
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
  reverseVatRules: z.string().optional(),
  hasVat: z.boolean(),
  vatPercent: z.string().optional(),
  hasCitytax: z.boolean().optional(),
  footerText: z.string().optional(),
  reverseCtaxRules: z.string().optional(),
  withDescription: z.boolean().optional(),
  skipEbarimt: z.boolean().optional(),
});

export interface PosInEbarimtConfig {
  title: string;
  posId: string;
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
  anotherRulesOfProductsOnVat: string;

  hasCitytax: boolean;
  footerText: string;
  citytaxPercent: string;
  anotherRulesOfProductsOnCitytax: string;
  withDescription: boolean;
  skipEbarimt: boolean;
}

export type TPosInEbarimtConfig = z.infer<
  typeof addEBarimtPosInConfigSchema
>;
