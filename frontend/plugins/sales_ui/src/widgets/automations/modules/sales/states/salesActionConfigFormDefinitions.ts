import { z } from 'zod';

export const salesActionConfigFormSchema = z.object({
  boardId: z.string(),
  pipelineId: z.string(),
  stageId: z.string(),
  name: z.string(),
  description: z.string(),
  assignedTo: z.string(),
  closeDate: z.string(),
  labelIds: z.string(),
  priority: z.string(),
});

export type TSalesActionConfigForm = z.infer<
  typeof salesActionConfigFormSchema
>;
