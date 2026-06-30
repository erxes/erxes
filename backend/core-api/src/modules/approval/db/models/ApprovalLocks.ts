import { Model } from 'mongoose';
import {
  APPROVAL_LOCK_STATUSES,
  ApprovalLock,
  ApprovalLockCreateInput,
} from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  approvalLockSchema,
  IApprovalLockDocument,
} from '../definitions/approvalLocks';

type ApprovalLockCreateModelInput = ApprovalLockCreateInput & {
  lockedBy: string;
  ownerIdSnapshot?: string;
};

type ApprovalLockReleaseInput = {
  releasedBy: string;
  releaseReason?: string;
};

export interface IApprovalLockModel extends Model<IApprovalLockDocument> {
  getActiveLock(input: {
    contentType: string;
    contentId: string;
  }): Promise<ApprovalLock | null>;
  getLock(_id: string): Promise<ApprovalLock>;
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
