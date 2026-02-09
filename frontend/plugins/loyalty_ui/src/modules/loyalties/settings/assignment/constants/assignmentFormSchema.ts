import { z } from 'zod';

export const AssignmentTypeSchema = z.enum(['fixed', 'percentage', 'free']);
export const AssignmentStatusSchema = z.enum(['active', 'inactive', 'expired']);

export const assignmentFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  status: z.string().optional(),
  startDate: z
    .union([z.string(), z.date()])
    .refine((val) => val !== '', 'Start date is required'),
  endDate: z
    .union([z.string(), z.date()])
    .refine((val) => val !== '', 'End date is required'),
  voucherCampaignId: z.string().optional(),
  segmentIds: z.array(z.string()).optional(),
});

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;
