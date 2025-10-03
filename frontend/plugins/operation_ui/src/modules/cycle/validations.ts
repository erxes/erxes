import { z } from 'zod';

export const addCycleSchema = z.object({
  name: z.string().min(1),
  teamId: z.string().min(1),
  startDate: z.date(),
  endDate: z.date(),
});
