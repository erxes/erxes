import { z } from 'zod';
import { addEBarimtStageInConfigSchema } from '../constants/addEBarimtStageConfigSchema';

export interface StageInEbarimtConfig {
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
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

export type TStageInEbarimtConfig = z.infer<
  typeof addEBarimtStageInConfigSchema
>;
