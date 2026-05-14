import { z } from 'zod';

export const addPipelineRemainderConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  boardId: z.string().min(1, 'Board is required'),
  pipelineId: z.string().min(1, 'Pipeline is required'),
  stageId: z.string().min(1, 'Stage is required'),
  account: z.string().min(1, 'Account is required'),
  location: z.string().min(1, 'Location is required'),
});
