import { z } from 'zod';

export const SUPPORT_ACCESS_MODES = ['off', 'approval', 'allow'] as const;

export const SUPPORT_GRANT_HOURS = [1, 4, 24, 168] as const;

export const SUPPORT_ACCESS_POLICY_SCHEMA = z.object({
  mode: z.enum(SUPPORT_ACCESS_MODES),
  allowUntil: z.date().nullable(),
  permissionGroupIds: z.array(z.string()),
});

export type TSupportAccessPolicyForm = z.infer<
  typeof SUPPORT_ACCESS_POLICY_SCHEMA
>;

export const SUPPORT_GRANT_APPROVAL_SCHEMA = z.object({
  hours: z
    .number()
    .refine((hours) => SUPPORT_GRANT_HOURS.some((value) => value === hours)),
  // The message is a translation key, read by the dialog
  permissionGroupIds: z.array(z.string()).min(1, 'approve-groups-required'),
});

export type TSupportGrantApprovalForm = z.infer<
  typeof SUPPORT_GRANT_APPROVAL_SCHEMA
>;
