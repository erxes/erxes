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
  branchOfProvince: string;
  subProvince: string;
  districtCode: string;
  companyName: string;
  defaultUnitedCode: string;
  headerText: string;
  branchNo: string;
  hasVat: boolean;
  vatPercent: string;
  anotherRulesOfProductsOnVat: string;
  vatPayableAccount: string;
  hasAllCitytax: boolean;
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
