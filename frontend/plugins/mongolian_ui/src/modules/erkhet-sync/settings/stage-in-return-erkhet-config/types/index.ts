import { z } from 'zod';
import { addStageInReturnErkhetConfigSchema } from '@/erkhet-sync/settings/stage-in-return-erkhet-config/constants/addStageInReturnErkhetConfigSchema';

export interface ReturnErkhetConfig {
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  userEmail?: string;
  returnType: string;
}

export type TReturnErkhetConfig = z.infer<
  typeof addStageInReturnErkhetConfigSchema
>;
