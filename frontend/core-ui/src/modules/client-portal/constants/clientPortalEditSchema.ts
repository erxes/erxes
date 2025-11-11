import { z } from 'zod';

export const CLIENTPORTAL_EDIT_SCHEMA = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  domain: z.string().url(),
});
