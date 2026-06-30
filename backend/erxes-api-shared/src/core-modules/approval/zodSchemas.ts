import { z } from 'zod';
import { APPROVAL_APPROVER_SCOPES, APPROVAL_MODES } from './constants';

const ownerIdsByContentIdSchema = z.record(z.string(), z.string()).optional();

export const approvalLockCheckInputSchema = z.object({
  contentType: z.string().min(1),
  contentId: z.string().min(1),
  ownerId: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
});

export const approvalLockStatesInputSchema = z.object({
  contentType: z.string().min(1),
  contentIds: z.array(z.string().min(1)),
  ownerIdsByContentId: ownerIdsByContentIdSchema,
  action: z.string().optional(),
  userId: z.string().optional(),
});

export const approvalLockCreateInputSchema = z.object({
  contentType: z.string().min(1),
  contentId: z.string().min(1),
  ownerId: z.string().optional(),
  allowedUserIds: z.array(z.string()).optional(),
  approverScope: z.enum([
    APPROVAL_APPROVER_SCOPES.LOCKER_ONLY,
    APPROVAL_APPROVER_SCOPES.LOCKER_AND_ALLOWED_USERS,
  ]),
  approvalMode: z.enum([APPROVAL_MODES.FIRST_WINS, APPROVAL_MODES.UNANIMOUS]),
});

export const approvalRequestCreateInputSchema = z.object({
  contentType: z.string().min(1),
  contentId: z.string().min(1),
  reason: z.string().optional(),
});
