import type { ApolloError } from '@apollo/client';
import type { MouseEvent } from 'react';
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
> & {
  selected: boolean;
  selectionFocused: boolean;
  onOpen: (event: MouseEvent<HTMLAnchorElement>) => void;
};

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

export interface NotificationSelection {
  selectedIds: string[];
  focusedId: string | null;
  select: (id: string, shiftKey: boolean) => void;
  extend: (direction: 1 | -1) => void;
  setAnchor: (id: string) => void;
  clear: () => void;
}

export interface UseNotificationListActionsResult
  extends Pick<NotificationSelection, 'selectedIds' | 'focusedId' | 'clear'> {
  markingAsRead: boolean;
  markSelectedAsRead: () => Promise<void>;
  onOpen: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
}

export interface NotificationSelectionToolbarProps {
  selectedCount: number;
  markingAsRead: boolean;
  onMarkAsRead: () => Promise<void>;
  onClear: () => void;
}
