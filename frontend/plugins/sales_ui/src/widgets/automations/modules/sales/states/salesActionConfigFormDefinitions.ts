import { z } from 'zod';

export const salesActionConfigFormSchema = z.object({
  boardId: z.string(),
  pipelineId: z.string(),
  stageId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  closeDate: z.string().optional(),
  labelIds: z.string().optional(),
  priority: z.string().optional(),
});

export type TSalesActionConfigForm = z.infer<
  typeof salesActionConfigFormSchema
>;
