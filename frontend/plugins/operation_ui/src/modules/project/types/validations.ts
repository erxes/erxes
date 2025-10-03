import { z } from 'zod';

export const addProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string(),
  status: z.number(),
  priority: z.number(),
  teamIds: z.array(z.string()),
  startDate: z.date().optional(),
  targetDate: z.date().optional(),
  leadId: z.string().optional(),
});
