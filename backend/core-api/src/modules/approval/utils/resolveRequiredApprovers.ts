import {
  APPROVAL_APPROVER_SCOPES,
  ApprovalLock,
} from 'erxes-api-shared/core-modules';

const unique = (ids: string[]) => [...new Set(ids.filter(Boolean))];

export const resolveRequiredApprovers = (
  lock: ApprovalLock,
  requesterId: string,
) => {
  const approverIds =
    lock.approverScope === APPROVAL_APPROVER_SCOPES.LOCKER_AND_ALLOWED_USERS
      ? [lock.lockedBy, ...lock.allowedUserIds]
      : [lock.lockedBy];

  return unique(approverIds).filter((userId) => userId !== requesterId);
};
