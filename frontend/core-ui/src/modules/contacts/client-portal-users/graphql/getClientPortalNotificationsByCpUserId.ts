import { gql } from '@apollo/client';
import { GQL_PAGE_INFO } from 'erxes-ui';

export const GET_CLIENT_PORTAL_NOTIFICATIONS_BY_CP_USER_ID = gql`
  query getClientPortalNotificationsByCpUserId(
    $cpUserId: String!
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $status: CPNotificationStatus
    $priority: CPNotificationPriority
    $type: CPNotificationType
    $kind: CPNotificationKind
    $fromDate: String
    $endDate: String
    $clientPortalId: String
  ) {
    getClientPortalNotificationsByCpUserId(
      cpUserId: $cpUserId
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      status: $status
      priority: $priority
      type: $type
      kind: $kind
      fromDate: $fromDate
      endDate: $endDate
      clientPortalId: $clientPortalId
    ) {
      list {
        _id
        cpUserId
        clientPortalId
        title
        message
        type
        contentType
        contentTypeId
        isRead
        readAt
        priority
        priorityLevel
        metadata
        action
        kind
        result {
          ios
          android
          web
        }
        createdAt
        expiresAt
        updatedAt
      }
      ${GQL_PAGE_INFO}
    }
  }
`;
