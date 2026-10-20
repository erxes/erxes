import type { TNotification } from 'ui-modules';

export type NotificationChannelContentProps = Pick<
  TNotification,
  | 'action'
  | 'createdAt'
  | 'fromUser'
  | 'fromUserId'
  | 'contentTypeId'
  | 'message'
  | 'title'
>;

export type NotificationConversationDetailProps = {
  contentTypeId: string;
};

export type ChannelEventMetadataProps = Pick<
  TNotification,
  'action' | 'createdAt' | 'fromUser'
>;

export type ChannelUnavailableProps = {
  description: string;
  title: string;
};

export type TicketNotificationViewProps = {
  contentTypeId: string;
};

export type TicketOpenButtonProps = { contentTypeId: string };
