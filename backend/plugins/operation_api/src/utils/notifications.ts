import { sendNotification } from 'erxes-api-shared/core-modules';

const getTitle = (contentType: string) => {
  if (contentType === 'task') {
    return 'Task';
  }

  if (contentType === 'project') {
    return 'Project';
  }

  if (contentType === 'team') {
    return 'Team';
  }
};

const getMessage = (contentType: string, notificationType: string) => {
  switch (notificationType) {
    case 'taskAssignee':
      return 'You have been assigned to task';
    case 'taskStatus':
      return 'You have been assigned to task';
    case 'projectAssignee':
      return 'You have been assigned to project';
    case 'projectStatus':
      return 'You have been assigned to project';
    case 'note':
      return `You have been mentioned in note ${contentType}`;
    case 'team':
      return 'You have been invited to team';
    default:
      return 'Notification';
  }
};

export const createNotifications = async ({
  contentType,
  contentTypeId,
  fromUserId,
  subdomain,
  notificationType,
  userIds,
  action,
}: {
  contentType: string;
  contentTypeId: string;
  fromUserId: string;
  subdomain: string;
  notificationType: string;
  userIds: string[];
  action: string;
}) => {
  sendNotification(subdomain, {
    title: getTitle(contentType),
    message: getMessage(contentType, notificationType),
    type: 'info',
    userIds,
    priority: 'low',
    kind: 'user',
    fromUserId,
    contentType: `operation:${contentType}`,
    contentTypeId,
    notificationType,
    action,
    metadata: {
      contentTypeId,
    },
  });
};
