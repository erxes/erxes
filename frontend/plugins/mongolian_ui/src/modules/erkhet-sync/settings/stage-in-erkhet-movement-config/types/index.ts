import { z } from 'zod';
import { addStageInMovementErkhetConfigSchema } from '../constants/addStageInErkhetMovementConfigSchema';

export interface MovementErkhetConfig {
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  userEmail?: string;
  chooseResponseField: string;
  defaultCustomer?: string;
}

export type TMovementErkhetConfig = z.infer<
  typeof addStageInMovementErkhetConfigSchema
>;
