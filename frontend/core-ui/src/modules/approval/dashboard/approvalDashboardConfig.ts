import { z } from 'zod';

export const APPROVAL_DASHBOARD_LIMIT = 10;

export const APPROVAL_DASHBOARD_SCOPES = ['toDecide', 'requested'] as const;

// `toDecide`: pending requests naming me as an approver.
// `requested`: everything I asked for, whatever its status.
export const approvalRequestsConfigSchema = z.object({
  scope: z.enum(APPROVAL_DASHBOARD_SCOPES),
});

export type TApprovalRequestsConfig = z.infer<
  typeof approvalRequestsConfigSchema
>;

export const APPROVAL_REQUESTS_DEFAULT_CONFIG: TApprovalRequestsConfig = {
  scope: 'toDecide',
};
