import { z } from 'zod';

export const EMINTRO_SCHEMA = z.object({
  welcome: z.string().optional(),
  away: z.string().optional(),
  thank: z.string().optional(),
});
