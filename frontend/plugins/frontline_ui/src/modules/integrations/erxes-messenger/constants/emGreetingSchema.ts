import { z } from 'zod';

export const EMGREETING_SCHEMA = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
  supporterIds: z.array(z.string()).optional(),
  links: z.array(z.object({ url: z.string().url() })).optional(),
});
