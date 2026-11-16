import { z } from 'zod';

export const approvalConfigFormSchema = z.object({
  approverIds: z.string().trim().min(1, 'Choose at least one approver'),
  summary: z.string().trim().min(1, 'Say what is being approved'),
  timeoutHours: z
    .string()
    .optional()
    .refine((value) => !value || Number(value) > 0, {
      message: 'Enter a positive number of hours',
    }),
  // Branch targets, set by connecting the node's outputs on the canvas.
  approved: z.string().optional(),
  rejected: z.string().optional(),
});

export type TApprovalConfigForm = z.infer<typeof approvalConfigFormSchema>;
