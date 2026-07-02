import { Model } from 'mongoose';
import {
  APPROVAL_LOCK_STATUSES,
  APPROVAL_REQUEST_STATUSES,
  ApprovalAction,
  ApprovalApproverScope,
  ApprovalLock,
  ApprovalLockState,
  ApprovalMode,
  ApprovalRequest,
} from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  approvalLockSchema,
  IApprovalLockDocument,
} from '../definitions/approvalLocks';

type ApprovalLockCreateModelInput = {
  contentType: string;
  contentId: string;
  lockedBy: string;
  ownerIdSnapshot?: string;
  allowedUserIds?: string[];
  approverScope?: ApprovalApproverScope;
  approvalMode?: ApprovalMode;
};

type ApprovalLockReleaseInput = {
  releasedBy: string;
  releaseReason?: string;
};

type ApprovalUser = {
  _id: string;
  isOwner?: boolean;
};

type ApprovalLockStateInput = {
  user: ApprovalUser;
  contentType: string;
  contentId: string;
  ownerId?: string;
  action?: ApprovalAction;
};

type ApprovalLockStatesInput = {
  user: ApprovalUser;
  contentType: string;
  contentIds: string[];
  ownerIdsByContentId?: Record<string, string>;
  action?: ApprovalAction;
};

export interface IApprovalLockModel extends Model<IApprovalLockDocument> {
  getActiveLock(input: {
    contentType: string;
    contentId: string;
  }): Promise<ApprovalLock | null>;
  getLock(_id: string): Promise<ApprovalLock>;
  getState(input: ApprovalLockStateInput): Promise<ApprovalLockState>;
  getStates(input: ApprovalLockStatesInput): Promise<ApprovalLockState[]>;
  assertAccess(input: ApprovalLockStateInput): Promise<ApprovalLockState>;
  createLock(input: ApprovalLockCreateModelInput): Promise<ApprovalLock>;
  releaseLock(
    _id: string,
    input: ApprovalLockReleaseInput,
  ): Promise<ApprovalLock>;
}

const isDuplicateKeyError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: number }).code === 11000;

export const loadApprovalLockClass = (models: IModels) => {
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

  class ApprovalLockModel {
    public static async getActiveLock(input: {
      contentType: string;
      contentId: string;
    }) {
      return models.ApprovalLocks.findOne({
        ...input,
        status: APPROVAL_LOCK_STATUSES.ACTIVE,
      }).lean<ApprovalLock | null>();
    }

    public static async getLock(_id: string) {
      const lock = await models.ApprovalLocks.findOne({
        _id,
      }).lean<ApprovalLock | null>();

      if (!lock) {
        throw new ExpectedError('Approval lock not found', 'NOT_FOUND');
      }

      return lock;
    }

    public static async getState(
      input: ApprovalLockStateInput,
    ): Promise<ApprovalLockState> {
      const { user, contentType, contentId, action } = input;
      const lock = await models.ApprovalLocks.getActiveLock({
        contentType,
        contentId,
      });
      const content = {
        contentType,
        contentId,
        ownerId: input.ownerId || lock?.ownerIdSnapshot,
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
    }

    public static async getStates({
      user,
      contentType,
      contentIds,
      ownerIdsByContentId = {},
      action,
    }: ApprovalLockStatesInput): Promise<ApprovalLockState[]> {
      const locks = await models.ApprovalLocks.find({
        contentType,
        contentId: { $in: contentIds },
        status: APPROVAL_LOCK_STATUSES.ACTIVE,
      }).lean<ApprovalLock[]>();
      const locksByContentId = new Map(
        locks.map((lock) => [lock.contentId, lock]),
      );
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
    }

    public static async assertAccess(input: ApprovalLockStateInput) {
      const state = await models.ApprovalLocks.getState(input);

      if (!state.hasAccess) {
        throw new ExpectedError('Locked', 'FORBIDDEN');
      }

      return state;
    }

    public static async createLock(input: ApprovalLockCreateModelInput) {
      try {
        const lock = await models.ApprovalLocks.create({
          ...input,
          status: APPROVAL_LOCK_STATUSES.ACTIVE,
          createdAt: new Date(),
        });

        return lock.toObject<ApprovalLock>();
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new ExpectedError('Resource is already locked', 'CONFLICT');
        }

        throw error;
      }
    }

    public static async releaseLock(
      _id: string,
      { releasedBy, releaseReason }: ApprovalLockReleaseInput,
    ) {
      const released = await models.ApprovalLocks.findOneAndUpdate(
        { _id, status: APPROVAL_LOCK_STATUSES.ACTIVE },
        {
          $set: {
            status: APPROVAL_LOCK_STATUSES.RELEASED,
            releasedAt: new Date(),
            releasedBy,
            releaseReason,
          },
        },
        { new: true },
      ).lean<ApprovalLock | null>();

      if (!released) {
        throw new ExpectedError('Approval lock not found', 'NOT_FOUND');
      }

      return released;
    }
  }

  approvalLockSchema.loadClass(ApprovalLockModel);

  return approvalLockSchema;
};
