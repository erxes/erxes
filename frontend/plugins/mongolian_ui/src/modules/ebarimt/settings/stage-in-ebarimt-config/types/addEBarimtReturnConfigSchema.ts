import { z } from 'zod';

export const addEBarimtStageInConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  destinationStageBoard: z
    .string()
    .min(1, 'Destination stage board is required'),
  pipelineId: z.string().min(1, 'Pipeline is required'),
  stageId: z.string().min(1, 'Stage is required'),
  posNo: z.string().optional(),
  companyRD: z.string().optional(),
  merchantTin: z.string().optional(),
  branchOfProvice: z.string().optional(),
  subProvice: z.string().optional(),
  districtCode: z.string().optional(),
  companyName: z.string().optional(),
  defaultUnitedCode: z.string().optional(),
  headerText: z.string().optional(),
  branchNo: z.string().optional(),
  citytaxPercent: z.string().optional(),
  anotherRulesOfProductsOnVat: z.string().optional(),
  HasVat: z.boolean(),
  vatPercent: z.string().optional(),
  vatPayableAccount: z.string().optional(),
  HasAllCitytax: z.boolean().optional(),
  allCitytaxPayableAccount: z.string().optional(),
  footerText: z.string().optional(),
  anotherRulesOfProductsOnCitytax: z.string().optional(),
  withDescription: z.boolean().optional(),
  skipEbarimt: z.boolean().optional(),
});
