import { z } from 'zod';

export const normalizeRuleIds = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
};

export const addEBarimtStageInConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  boardId: z.string().min(1, 'Destination stage board is required'),
  pipelineId: z.string().min(1, 'Pipeline is required'),
  stageId: z.string().min(1, 'Stage is required'),
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

export type TStageInEbarimtConfig = z.infer<
  typeof addEBarimtStageInConfigSchema
>;
