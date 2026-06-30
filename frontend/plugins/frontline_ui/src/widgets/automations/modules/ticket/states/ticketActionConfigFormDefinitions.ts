import { z } from 'zod';

export const ticketActionConfigFormSchema = z.object({
  channelId: z.string().min(1, 'Channel is required'),
  pipelineId: z.string().min(1, 'Pipeline is required'),
  statusId: z.string().min(1, 'Status is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  labelIds: z.string().optional(),
  tagIds: z.string().optional(),
  companyIds: z.string().optional(),
});

export type TTicketActionConfigForm = z.infer<
  typeof ticketActionConfigFormSchema
>;
