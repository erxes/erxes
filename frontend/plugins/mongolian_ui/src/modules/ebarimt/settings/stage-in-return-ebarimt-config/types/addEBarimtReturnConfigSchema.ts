import { z } from 'zod';

export const addEBarimtReturnConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  destinationStageBoard: z
    .string()
    .min(1, 'Destination stage board is required'),
  pipelineId: z.string().min(1, 'Pipeline is required'),
  stageId: z.string().min(1, 'Stage is required'),
  userEmail: z.string().optional(),
  hasVat: z.boolean().optional(),
  hasCitytax: z.boolean().optional(),
});
