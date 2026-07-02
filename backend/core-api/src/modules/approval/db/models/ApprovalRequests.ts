import { Model } from 'mongoose';
import {
  APPROVAL_APPROVER_SCOPES,
  APPROVAL_NOTIFICATION_ACTIONS,
  APPROVAL_NOTIFICATION_CONTENT_TYPE,
  APPROVAL_REQUEST_STATUSES,
  ApprovalContentMeta,
  ApprovalLock,
  ApprovalNotificationMetadata,
  ApprovalRequest,
  ApprovalRequestCreateInput,
} from 'erxes-api-shared/core-modules';
import { ExpectedError, graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { PRIORITY_ORDER } from '~/modules/notifications/constants';
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

type ApprovalRequester = {
  _id: string;
  email?: string;
  username?: string;
  details?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
  };
};

type ApprovalRequestNotifyApproversInput = {
  subdomain: string;
  request: ApprovalRequest;
  lock: ApprovalLock;
  content: ApprovalContentMeta;
};

export interface IApprovalRequestModel extends Model<IApprovalRequestDocument> {
  getRequest(_id: string): Promise<ApprovalRequest>;
  getPendingRequest(input: {
    lockId: string;
    requesterId: string;
  }): Promise<ApprovalRequest | null>;
  getRequiredApproverIds(lock: ApprovalLock, requesterId: string): string[];
  notifyApprovers(
    input: ApprovalRequestNotifyApproversInput,
  ): Promise<string[]>;
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

const unique = (ids: string[]) => [...new Set(ids.filter(Boolean))];

const getRequesterName = (requester?: ApprovalRequester | null) => {
  if (!requester) {
    return 'Someone';
  }

  const firstLastName = [
    requester.details?.firstName,
    requester.details?.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    requester.details?.fullName ||
    firstLastName ||
    requester.email ||
    requester.username ||
    'Someone'
  );
};

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

    public static getRequiredApproverIds(
      lock: ApprovalLock,
      requesterId: string,
    ) {
      const approverIds =
        lock.approverScope === APPROVAL_APPROVER_SCOPES.LOCKER_AND_ALLOWED_USERS
          ? [lock.lockedBy, ...lock.allowedUserIds]
          : [lock.lockedBy];

      return unique(approverIds).filter((userId) => userId !== requesterId);
    }

    public static async notifyApprovers({
      subdomain,
      request,
      lock,
      content,
    }: ApprovalRequestNotifyApproversInput) {
      const requester = await models.Users.findOne(
        { _id: request.requesterId },
        { _id: 1, email: 1, username: 1, details: 1 },
      ).lean<ApprovalRequester | null>();

      const requesterName = getRequesterName(requester);
      const targetLabel = content.label || request.contentType;
      const metadata: ApprovalNotificationMetadata = {
        approvalRequestId: request._id,
        lockId: lock._id,
        targetContentType: request.contentType,
        targetContentId: request.contentId,
        targetLabel,
      };

      const notifications = await models.Notifications.insertMany(
        request.requiredApproverIds.map((userId) => ({
          title: 'Approval request',
          message: `${requesterName} requested access to ${targetLabel}`,
          type: 'info',
          userId,
          fromUserId: request.requesterId,
          contentType: APPROVAL_NOTIFICATION_CONTENT_TYPE,
          contentTypeId: request._id,
          priority: 'medium',
          priorityLevel: PRIORITY_ORDER.medium,
          metadata,
          action: APPROVAL_NOTIFICATION_ACTIONS.REQUESTED,
          kind: 'user',
          isRead: false,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })),
      );

      for (const notification of notifications) {
        graphqlPubsub.publish(
          `notificationInserted:${subdomain}:${notification.userId}`,
          {
            notificationInserted: { ...notification.toObject() },
          },
        );
      }

      return notifications.map((notification) => notification._id.toString());
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
