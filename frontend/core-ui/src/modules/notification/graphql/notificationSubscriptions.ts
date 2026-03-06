import { gql } from '@apollo/client';

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription notificationInserted($userId: String) {
    notificationInserted(userId: $userId) {
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
  }
`;

export const NOTIFICATION_READ = gql`
  subscription notificationRead($userId: String) {
    notificationRead(userId: $userId)
  }
`;
