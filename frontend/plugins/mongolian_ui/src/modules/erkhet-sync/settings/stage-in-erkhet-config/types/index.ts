import { z } from 'zod';
import { addStageInErkhetConfigSchema } from '../constants/addStageInErkhetConfigSchema';
export interface ErkhetConfig {
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  userEmail?: string;
  chooseResponseField: string;
  hasVat: boolean;
  hasCityTax: boolean;
  anotherRulesOfProductsOnCitytax: string;
  anotherRulesOfProductsOnVat: string;
  defaultPay: string;
  нэхэмжлэх: string;
  хаанБанкданс: string;
  голомтБанкданс: string;
  barter: string;
}

export type TErkhetConfig = z.infer<typeof addStageInErkhetConfigSchema>;
