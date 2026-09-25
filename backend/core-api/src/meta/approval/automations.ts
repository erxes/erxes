import { TApprovalChangeApplier } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const AUTOMATION_CHANGE_TYPES = {
  OWNERSHIP_TRANSFER: 'automations.ownershipTransfer',
} as const;

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
};
