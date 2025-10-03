import { z } from 'zod';

export const addTaskSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
  status: z.string().optional(),
  priority: z.number().optional(),
  startDate: z.date().optional(),
  targetDate: z.date().optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  cycleId: z.string().optional(),
  estimatePoint: z.number().min(0, 'Estimate point is required'),
});
