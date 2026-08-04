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

export const STAGE_IN_EBARIMT_DEFAULT_VALUES: TStageInEbarimtConfig = {
  ...EBARIMT_COMMON_DEFAULT_VALUES,
  boardId: '',
  pipelineId: '',
  stageId: '',
};

export const getStageInEBarimtFormValues = (
  detail: Partial<TStageInEbarimtConfig>,
): TStageInEbarimtConfig => ({
  ...getEBarimtCommonFormValues(detail),
  boardId: detail.boardId || '',
  pipelineId: detail.pipelineId || '',
  stageId: detail.stageId || '',
});
