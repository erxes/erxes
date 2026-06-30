import {
  APPROVAL_NOTIFICATION_ACTIONS,
  APPROVAL_NOTIFICATION_CONTENT_TYPE,
  ApprovalContentMeta,
  ApprovalLock,
  ApprovalNotificationMetadata,
  ApprovalRequest,
} from 'erxes-api-shared/core-modules';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { PRIORITY_ORDER } from '~/modules/notifications/constants';

type NotifyApprovalRequestInput = {
  models: IModels;
  subdomain: string;
  request: ApprovalRequest;
  lock: ApprovalLock;
  content: ApprovalContentMeta;
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

export const notifyApprovalRequest = async ({
  models,
  subdomain,
  request,
  lock,
  content,
}: NotifyApprovalRequestInput) => {
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
    targetLink: content.link,
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
};
