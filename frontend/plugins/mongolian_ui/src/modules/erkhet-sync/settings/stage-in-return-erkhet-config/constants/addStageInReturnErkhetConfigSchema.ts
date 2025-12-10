import { z } from 'zod';

export const addStageInReturnErkhetConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  boardId: z.string().min(1, 'Destination stage board is required'),
  pipelineId: z.string().min(1, 'Pipeline is required'),
  stageId: z.string().min(1, 'Stage is required'),
  userEmail: z.string().min(1, 'User email is required'),
  returnType: z.string().min(1, 'Return type is required'),
});
