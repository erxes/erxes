import type { ApolloError } from '@apollo/client';
import type { TNotification } from 'ui-modules';

export type MarkNotificationAsRead = (id: string) => Promise<boolean>;

export interface UseNotificationNavigationOptions {
  id: string | undefined;
  notification: TNotification | undefined;
  handleMarkAsRead: MarkNotificationAsRead;
}

export interface UseNotificationNavigationResult {
  previousNotification: TNotification | undefined;
  nextNotification: TNotification | undefined;
  navigateToNotification: (notification: TNotification) => void;
  dismissNotification: () => Promise<void>;
  dismissing: boolean;
}

export interface UseNotificationResult extends UseNotificationNavigationResult {
  id: string | undefined;
  notification: TNotification | undefined;
  loading: boolean;
  error: ApolloError | undefined;
}

export type NotificationItemProps = Pick<
  TNotification,
  '_id' | 'createdAt' | 'message' | 'isRead' | 'contentType' | 'priority'
>;

export interface NotificationIconProps {
  contentType: string;
}

export interface UseNotificationListResult {
  notifications: TNotification[];
  loading: boolean;
  inViewRef: (node?: Element | null) => void;
  isEmpty: boolean;
  hasMore: boolean;
}
