import { z } from 'zod';

export const operationCompletionTriggerConfigFormSchema = z.object({
  mode: z.enum(['every', 'some', 'first', 'last']).optional(),
  projectId: z.string().optional(),
  milestoneId: z.string().optional(),
  teamIds: z.array(z.string()).optional(),
});

export type TOperationCompletionTriggerConfigForm = z.infer<
  typeof operationCompletionTriggerConfigFormSchema
>;
