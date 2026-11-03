import type { ApolloError } from '@apollo/client';
import type { MouseEvent, RefObject } from 'react';
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
  | '_id'
  | 'createdAt'
  | 'title'
  | 'message'
  | 'isRead'
  | 'contentType'
  | 'priority'
  | 'type'
  | 'fromUser'
> & {
  selected: boolean;
  selectionDisabled?: boolean;
  selectionFocused: boolean;
  onToggleSelection?: (shiftKey: boolean) => void;
  onOpen: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export interface NotificationIconProps {
  contentType: string;
}

export type NotificationSenderAvatarProps = Pick<TNotification, 'fromUser'>;

export interface NotificationPriorityProps {
  priority?: string | null;
}

export interface UseNotificationItemScrollOptions {
  isActive: boolean;
  selectionFocused: boolean;
}

export type UseNotificationItemScrollResult = RefObject<HTMLAnchorElement>;

export interface UseNotificationListResult {
  notifications: TNotification[];
  groups: [string, TNotification[]][];
  loading: boolean;
  inViewRef: (node?: Element | null) => void;
  isEmpty: boolean;
  hasMore: boolean;
  error: ApolloError | undefined;
  fetchMoreError: string | null;
  fetchingMore: boolean;
  retry: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export interface NotificationSelection {
  selectedIds: string[];
  focusedId: string | null;
  select: (id: string, shiftKey: boolean) => void;
  toggleAll: () => void;
  extend: (direction: 1 | -1) => void;
  setAnchor: (id: string) => void;
  clear: () => void;
}

export interface UseNotificationListActionsResult
  extends Pick<
    NotificationSelection,
    'selectedIds' | 'focusedId' | 'clear' | 'select' | 'toggleAll'
  > {
  pending: boolean;
  allRead: boolean;
  markSelectedAsRead: () => Promise<void>;
  deleteSelected: () => Promise<void>;
  onOpen: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
}

export interface NotificationSelectionToolbarProps {
  selectedCount: number;
  visibleCount: number;
  pending: boolean;
  allRead: boolean;
  onToggleAll: () => void;
  onMarkAsRead: () => Promise<void>;
  onDelete: () => Promise<void>;
  onClear: () => void;
}
