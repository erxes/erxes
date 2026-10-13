import { gql } from '@apollo/client';

export const NOTIFICATION_PORTAL_MARK_READ = gql`
  mutation notificationPortalMarkRead($id: String!) {
    clientPortalMarkNotificationAsRead(_id: $id)
  }
`;

export const NOTIFICATION_PORTAL_MARK_ALL_READ = gql`
  mutation notificationPortalMarkAllRead {
    clientPortalMarkAllNotificationsAsRead
  }
`;
