import { z } from 'zod';
import { addPipelineRemainderConfigSchema } from '../constants/addPipelineRemainderConfigSchema';

export interface AddPipelineRemainderConfig {
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  account: string;
  location: string;
}

export type TAddPipelineRemainderConfig = z.infer<
  typeof addPipelineRemainderConfigSchema
>;
