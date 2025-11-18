import { gql } from '@apollo/client';

export const ACTIVITY_LOG_INSERTED = gql`
  subscription activityLogInserted(
    $userId: String
    $targetType: String
    $targetId: String
  ) {
    activityLogInserted(userId: $userId, targetType: $targetType, targetId: $targetId) {
      _id
      createdAt
      actorType
      actor
      targetType
      target
      action
      context
      contextType
      changes
      activityType
      metadata
    }
  }
`;

