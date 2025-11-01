import { z } from 'zod';

export const addTicketSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  statusId: z.string(),
  priority: z.number().optional(),
  startDate: z.date().optional(),
  targetDate: z.date().optional(),
  labelIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  assigneeId: z.string().optional(),
  userId: z.string().optional(),
  channelId: z.string().optional(),
  pipelineId: z.string().optional().nullable(),
});
