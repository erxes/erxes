import { z } from 'zod';
import { addEBarimtStageInConfigSchema } from './addEBarimtReturnConfigSchema';

export interface StageInEbarimtConfig {
  title: string;
  destinationStageBoard: string;
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
  HasVat: boolean;
  vatPercent: string;
  anotherRulesOfProductsOnVat: string;
  vatPayableAccount: string;

  HasAllCitytax: boolean;
  allCitytaxPayableAccount: string;
  footerText: string;
  citytaxPercent: string;
  anotherRulesOfProductsOnCitytax: string;
  withDescription: boolean;
  skipEbarimt: boolean;
}

export type TStageInEbarimtConfig = z.infer<
  typeof addEBarimtStageInConfigSchema
>;
