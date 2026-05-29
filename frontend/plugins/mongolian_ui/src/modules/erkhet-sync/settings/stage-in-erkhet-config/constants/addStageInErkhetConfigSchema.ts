import { z } from 'zod';

export const addStageInErkhetConfigSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    boardId: z.string().min(1, 'Destination stage board is required'),
    pipelineId: z.string().min(1, 'Pipeline is required'),
    stageId: z.string().min(1, 'Stage is required'),
    userEmail: z.string().min(1, 'User email is required'),
    responseField: z.string().optional().default(''),
    hasVat: z.boolean(),
    hasCitytax: z.boolean(),
    reverseVatRules: z.array(z.string()).optional().default([]),
    reverseCtaxRules: z.array(z.string()).optional().default([]),
    defaultPay: z.string().optional().default('debtAmount'),
  })
  .catchall(z.any());
