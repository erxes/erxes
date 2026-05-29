import { z } from 'zod';
import { addStageInErkhetConfigSchema } from '../constants/addStageInErkhetConfigSchema';
export interface ErkhetConfig {
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  userEmail?: string;
  responseField?: string;
  hasVat: boolean;
  hasCitytax: boolean;
  reverseVatRules?: string[];
  reverseCtaxRules?: string[];
  defaultPay?: string;
  [paymentType: string]: any;
}

export type TErkhetConfig = z.infer<typeof addStageInErkhetConfigSchema>;
