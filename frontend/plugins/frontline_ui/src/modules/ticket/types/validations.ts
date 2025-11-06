import { z } from 'zod';

export const addTicketSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  channelId: z.string({ required_error: 'Channel is required' }),
  pipelineId: z.string({ required_error: 'Pipeline is required' }).nullable(),
  statusId: z.string({ required_error: 'Status is required' }),
  priority: z.number().optional(),
  startDate: z.date().optional(),
  targetDate: z.date().optional(),
  labelIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  assigneeId: z.string().optional(),
  userId: z.string().optional(),
});
