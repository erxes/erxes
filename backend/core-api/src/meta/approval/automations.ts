import {
  sendAutomationApprovalDecision,
  TApprovalChangeApplier,
  TApprovalChangeRejecter,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const AUTOMATION_CHANGE_TYPES = {
  OWNERSHIP_TRANSFER: 'automations.ownershipTransfer',
  APPROVAL_STEP: 'automations.approvalStep',
} as const;

type TApprovalStepDecision = 'approved' | 'rejected';

/** Hands an approval step's decision to the run waiting on it. */
const resolveApprovalStep = async (
  subdomain: string,
  payload: Record<string, unknown> | undefined,
  decision: TApprovalStepDecision,
  userId?: string,
  reason?: string,
) => {
  const executionId = String(payload?.executionId || '');
  const actionId = String(payload?.actionId || '');

  if (!executionId || !actionId) {
    throw new Error('Approval step request names no waiting run');
  }

  // A failure surfaces on the request instead of passing for applied
  await sendAutomationApprovalDecision(subdomain, {
    executionId,
    actionId,
    decision,
    userId,
    reason,
  });
};

/**
 * Ownership is a liability, so it moves only when the person taking it on has
 * approved the request carrying it — and it moves here, once, when they do.
 */
const applyOwnershipTransfer: TApprovalChangeApplier<IModels> = async ({
  models,
  contentId,
  payload,
  approverId,
}) => {
  const toUserId = String(payload?.toUserId || '');

  if (toUserId !== approverId) {
    throw new Error('Only the person it was offered to can take it on');
  }

  const automation = await models.Automations.getAutomation(contentId);

  if (!automation) {
    throw new Error('Automation not found');
  }

  await models.Automations.setOwner(contentId, toUserId);
};

export const automationChangeAppliers: Record<
  string,
  TApprovalChangeApplier<IModels>
> = {
  [AUTOMATION_CHANGE_TYPES.OWNERSHIP_TRANSFER]: applyOwnershipTransfer,
  [AUTOMATION_CHANGE_TYPES.APPROVAL_STEP]: ({ subdomain, payload, approverId }) =>
    resolveApprovalStep(subdomain, payload, 'approved', approverId),
};

export const automationChangeRejecters: Record<
  string,
  TApprovalChangeRejecter<IModels>
> = {
  [AUTOMATION_CHANGE_TYPES.APPROVAL_STEP]: ({
    subdomain,
    payload,
    rejecterId,
    reason,
  }) => resolveApprovalStep(subdomain, payload, 'rejected', rejecterId, reason),
};
