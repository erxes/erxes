import { z } from 'zod';
import { addStageInMovementErkhetConfigSchema } from '../constants/addStageInErkhetMovementConfigSchema';

export interface IMovementDetail {
  _id: string;
  productCategory?: string;
  branch?: string;
  department?: string;
  mainAccount?: string;
  mainLocation?: string;
  moveAccount?: string;
  moveLocation?: string;
}

export interface MovementErkhetConfig {
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  userEmail?: string;
  chooseResponseField: string;
  defaultCustomer?: string;
  details?: IMovementDetail[];
}

export type TMovementErkhetConfig = z.infer<
  typeof addStageInMovementErkhetConfigSchema
>;
