import { z } from 'zod';

export const EMAPPEARANCE_SCHEMA = z.object({
  color: z.string().optional(),
  textColor: z.string().optional(),
  logo: z.string().optional(),
});
