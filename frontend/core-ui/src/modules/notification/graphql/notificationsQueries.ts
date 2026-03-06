import { gql } from '@apollo/client';

export const NOTIFICATIONS = gql`
  query Notifications(
    $ids: [String]
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $status: NotificationStatus
    $priority: NotificationPriority
    $type: NotificationType
    $fromDate: String
    $endDate: String
    $fromUserId: String
  ) {
    notifications(
      ids: $ids
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      status: $status
      priority: $priority
      type: $type
      fromDate: $fromDate
      endDate: $endDate
      fromUserId: $fromUserId
    ) {
      list {
        _id
        title
        message
        type
        fromUserId
        priority
        isRead
        contentType
        contentTypeId
        action
        kind
        updatedAt
        createdAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const NOTIFICATION_DETAIL = gql`
  query NotificationDetail($_id: String!) {
    notificationDetail(_id: $_id) {
      _id
      title
      message
      type
      fromUserId
      priority
      metadata
      createdAt
      isRead
      contentType
      contentTypeId
      action
      kind
      updatedAt
      emailDelivery {
        _id
        status
        error
        sentAt
      }
    }
  }
`;

export const UNREAD_NOTIFICATIONS_COUNT = gql`
  query UnreadNotificationsCount {
    unreadNotificationsCount
  }
`;
