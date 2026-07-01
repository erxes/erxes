import {
  APPROVAL_LOCK_STATUSES,
  APPROVAL_REQUEST_STATUSES,
  ApprovalAction,
  ApprovalContentMeta,
  ApprovalLock,
  ApprovalLockState,
  ApprovalRequest,
} from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { resolveApprovalContent } from './resolveApprovalContent';

type ApprovalUser = {
  _id: string;
  isOwner?: boolean;
};

type BaseLockStateInput = {
  models: IModels;
  user: ApprovalUser;
  contentType: string;
  contentId: string;
  ownerId?: string;
  action?: ApprovalAction;
};

type BatchLockStateInput = {
  models: IModels;
  user: ApprovalUser;
  contentType: string;
  contentIds: string[];
  ownerIdsByContentId?: Record<string, string>;
  action?: ApprovalAction;
};

const hasLockAccess = ({
  lock,
  ownerId,
  user,
}: {
  lock: ApprovalLock;
  ownerId?: string;
  user: ApprovalUser;
}) =>
  user.isOwner === true ||
  user._id === ownerId ||
  user._id === lock.lockedBy ||
  lock.allowedUserIds.includes(user._id);

const getContentMeta = async (
  input: BaseLockStateInput,
): Promise<ApprovalContentMeta> => {
  const content = await resolveApprovalContent(input);

  if (input.ownerId && !content.ownerId) {
    return {
      ...content,
      ownerId: input.ownerId,
    };
  }

  return content;
};

export const resolveLockState = async (
  input: BaseLockStateInput,
): Promise<ApprovalLockState> => {
  const { models, user, contentType, contentId, action } = input;
  const content = await getContentMeta(input);
  const lock = await models.ApprovalLocks.getActiveLock({
    contentType,
    contentId,
  });

  if (!lock) {
    return {
      contentType,
      contentId,
      action,
      locked: false,
      hasAccess: true,
      content,
    };
  }

  const ownerId = content.ownerId || lock.ownerIdSnapshot || input.ownerId;
  const hasAccess = hasLockAccess({ lock, ownerId, user });
  const pendingRequest = hasAccess
    ? null
    : await models.ApprovalRequests.getPendingRequest({
        lockId: lock._id,
        requesterId: user._id,
      });

  return {
    contentType,
    contentId,
    action,
    locked: true,
    hasAccess,
    reason: hasAccess ? undefined : 'Locked',
    content: {
      ...content,
      ownerId,
    },
    lock,
    pendingRequest: pendingRequest || undefined,
  };
};

export const resolveLockStates = async ({
  models,
  user,
  contentType,
  contentIds,
  ownerIdsByContentId = {},
  action,
}: BatchLockStateInput): Promise<ApprovalLockState[]> => {
  const locks = await models.ApprovalLocks.find({
    contentType,
    contentId: { $in: contentIds },
    status: APPROVAL_LOCK_STATUSES.ACTIVE,
  }).lean<ApprovalLock[]>();
  const locksByContentId = new Map(locks.map((lock) => [lock.contentId, lock]));
  const inaccessibleLockIds = locks
    .filter((lock) => {
      const ownerId =
        ownerIdsByContentId[lock.contentId] || lock.ownerIdSnapshot;

      return !hasLockAccess({ lock, ownerId, user });
    })
    .map((lock) => lock._id);
  const pendingRequests = inaccessibleLockIds.length
    ? await models.ApprovalRequests.find({
        lockId: { $in: inaccessibleLockIds },
        requesterId: user._id,
        status: APPROVAL_REQUEST_STATUSES.PENDING,
      }).lean<ApprovalRequest[]>()
    : [];
  const pendingRequestsByLockId = new Map(
    pendingRequests.map((request) => [request.lockId, request]),
  );

  return contentIds.map((contentId) => {
    const lock = locksByContentId.get(contentId);
    const ownerId =
      ownerIdsByContentId[contentId] || lock?.ownerIdSnapshot || undefined;
    const content = {
      contentType,
      contentId,
      ownerId,
    };

    if (!lock) {
      return {
        contentType,
        contentId,
        action,
        locked: false,
        hasAccess: true,
        content,
      };
    }

    const hasAccess = hasLockAccess({ lock, ownerId, user });

    return {
      contentType,
      contentId,
      action,
      locked: true,
      hasAccess,
      reason: hasAccess ? undefined : 'Locked',
      content,
      lock,
      pendingRequest: hasAccess
        ? undefined
        : pendingRequestsByLockId.get(lock._id),
    };
  });
};

export const assertLockAccess = async (input: BaseLockStateInput) => {
  const state = await resolveLockState(input);

  if (!state.hasAccess) {
    throw new ExpectedError('Locked', 'FORBIDDEN');
  }

  return state;
};
