import { Model } from 'mongoose';
import {
  APPROVAL_REQUEST_STATUSES,
  ApprovalRequest,
  ApprovalRequestCreateInput,
} from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  approvalRequestSchema,
  IApprovalRequestDocument,
} from '../definitions/approvalRequests';

type ApprovalRequestCreateModelInput = ApprovalRequestCreateInput & {
  lockId: string;
  requesterId: string;
  requiredApproverIds: string[];
};

type ApprovalRequestResolveInput = {
  status: ApprovalRequest['status'];
  resolvedAt?: Date;
  notificationIds?: string[];
};

export interface IApprovalRequestModel extends Model<IApprovalRequestDocument> {
  getRequest(_id: string): Promise<ApprovalRequest>;
  getPendingRequest(input: {
    lockId: string;
    requesterId: string;
  }): Promise<ApprovalRequest | null>;
  createRequest(
    input: ApprovalRequestCreateModelInput,
  ): Promise<ApprovalRequest>;
  resolveRequest(
    _id: string,
    input: ApprovalRequestResolveInput,
  ): Promise<ApprovalRequest>;
}

const isDuplicateKeyError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: number }).code === 11000;

export const loadApprovalRequestClass = (models: IModels) => {
  class ApprovalRequestModel {
    public static async getRequest(_id: string) {
      const request = await models.ApprovalRequests.findOne({
        _id,
      }).lean<ApprovalRequest | null>();

      if (!request) {
        throw new ExpectedError('Approval request not found', 'NOT_FOUND');
      }

      return request;
    }

    public static async getPendingRequest(input: {
      lockId: string;
      requesterId: string;
    }) {
      return models.ApprovalRequests.findOne({
        ...input,
        status: APPROVAL_REQUEST_STATUSES.PENDING,
      }).lean<ApprovalRequest | null>();
    }

    public static async createRequest(input: ApprovalRequestCreateModelInput) {
      try {
        const request = await models.ApprovalRequests.create({
          ...input,
          status: APPROVAL_REQUEST_STATUSES.PENDING,
          decisions: [],
          createdAt: new Date(),
        });

        return request.toObject<ApprovalRequest>();
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          const pending = await models.ApprovalRequests.getPendingRequest({
            lockId: input.lockId,
            requesterId: input.requesterId,
          });

          if (pending) {
            return pending;
          }
        }

        throw error;
      }
    }

    public static async resolveRequest(
      _id: string,
      input: ApprovalRequestResolveInput,
    ) {
      const request = await models.ApprovalRequests.findOneAndUpdate(
        { _id },
        { $set: input },
        { new: true },
      ).lean<ApprovalRequest | null>();

      if (!request) {
        throw new ExpectedError('Approval request not found', 'NOT_FOUND');
      }

      return request;
    }
  }

  approvalRequestSchema.loadClass(ApprovalRequestModel);

  return approvalRequestSchema;
};
