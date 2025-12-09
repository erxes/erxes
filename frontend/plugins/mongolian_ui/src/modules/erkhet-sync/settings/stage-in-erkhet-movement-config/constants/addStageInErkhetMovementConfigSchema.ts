import { z } from 'zod';

export const addStageInMovementErkhetConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  boardId: z.string().min(1, 'Destination stage board is required'),
  pipelineId: z.string().min(1, 'Pipeline is required'),
  stageId: z.string().min(1, 'Stage is required'),
  userEmail: z.string().min(1, 'User email is required'),
  chooseResponseField: z.string().min(1, 'Choose response field is required'),
  defaultCustomer: z.string().min(1, 'Default customer is required'),
});
