import { z } from 'zod';

export const RecordReferenceResolveInput = z.object({
  subdomain: z.string(),
  data: z.object({
    type: z.string(),
    path: z.string(),
    target: z.any().optional(),
    targetId: z.string().optional(),
    targetIds: z.array(z.string()).optional(),
    defaultValue: z.any().optional(),
  }),
});
