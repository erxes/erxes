import { gql } from '@apollo/client';

export const BROADCAST_MESSAGE_ADD = gql`
  mutation engageMessageAdd(
    $title: String
    $kind: String
    $method: String
    $fromUserId: String
    $targetType: String
    $targetIds: [String]
    $targetCount: Int
    $isDraft: Boolean
    $isLive: Boolean
    $email: EngageMessageEmail
    $messenger: EngageMessageMessenger
    $notification: EngageMessageNotification
  ) {
    engageMessageAdd(
      title: $title
      kind: $kind
      method: $method
      fromUserId: $fromUserId

      targetType: $targetType
      targetIds: $targetIds
      targetCount: $targetCount

      isDraft: $isDraft
      isLive: $isLive

      email: $email
      messenger: $messenger
      notification: $notification
    ) {
      _id
    }
  }
`;
