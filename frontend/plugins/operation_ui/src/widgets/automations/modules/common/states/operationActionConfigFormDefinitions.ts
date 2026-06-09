import { z } from 'zod';

export const taskActionConfigFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  teamId: z.string().min(1, 'Team is required'),
  status: z.string().min(1, 'Status is required'),
  description: z.string().optional(),
  priority: z.number().optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  milestoneId: z.string().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  tagIds: z.string().optional(),
});

export const projectActionConfigFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  teamIds: z.array(z.string()).min(1, 'Team is required'),
  description: z.string().optional(),
  status: z.number().optional(),
  priority: z.number().optional(),
  leadId: z.string().optional(),
  memberIds: z.string().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  tagIds: z.string().optional(),
});

export type TTaskActionConfigForm = z.infer<typeof taskActionConfigFormSchema>;

export type TProjectActionConfigForm = z.infer<
  typeof projectActionConfigFormSchema
>;

export type TOperationActionConfigForm =
  | TTaskActionConfigForm
  | TProjectActionConfigForm;
