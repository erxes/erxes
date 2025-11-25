import { z } from 'zod';

export const stageProbalityTriggerConfigFormSchema = z.object({
  probability: z.string(),
  stageId: z.string().optional(),
  pipelineId: z.string().optional(),
  boardId: z.string().optional(),
});

export type TStageProbalityTriggerConfigForm = z.infer<
  typeof stageProbalityTriggerConfigFormSchema
>;
