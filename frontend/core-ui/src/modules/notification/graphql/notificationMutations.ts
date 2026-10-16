import { gql } from '@apollo/client';

export const MARK_AS_READ_NOTIFICATION = gql`
  mutation MarkNotificationAsRead($id: String!) {
    markNotificationAsRead(_id: $id)
  }
`;

export const ARCHIVE_NOTIFICATION = gql`
  mutation ArchiveNotification($id: String!) {
    archiveNotification(_id: $id)
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAsReadNotifications(ids: [], status: UNREAD)
  }
`;
