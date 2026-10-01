import { gql } from '@apollo/client';

export const NOTIFICATION_PORTAL_LIST = gql`
  query notificationPortalList($limit: Int, $status: CPNotificationStatus) {
    clientPortalNotifications(limit: $limit, status: $status) {
      list {
        _id
        title
        message
        type
        contentType
        contentTypeId
        isRead
        priority
        createdAt
        updatedAt
      }
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
