import { sendNotification } from 'erxes-api-shared/core-modules';

const getTitle = (contentType: string) => {
  if (contentType === 'ticket') {
    return 'ticket';
  }

  if (contentType === 'inbox') {
    return 'Inbox';
  }

  if (contentType === 'channel') {
    return 'Channel';
  }

  if (contentType === 'status') {
    return 'Status';
  }
};

const getMessage = (contentType: string, notificationType: string) => {
  switch (notificationType) {
    case 'ticketAssignee':
      return 'You have been assigned to ticket';
    case 'ticketStatus':
      return 'Ticket status updated';
    case 'inboxAssignee':
      return 'You have been assigned to conversation';
    case 'internalNote':
      return `You have been mentioned in ${contentType}'s conversation`;
    case 'updateTicket':
      return `Ticket updated`;
    case 'note':
      return `You have been mentioned in ${contentType}'s note`;
    case 'channel':
      return 'You have been invited to channel';
    case 'status':
      return 'Your team has a new status';
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
    contentType: `frontline:${contentType}`,
    contentTypeId,
    notificationType,
    action,
    metadata: {
      contentTypeId,
    },
  });
};
