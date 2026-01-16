import { gql } from '@apollo/client';

export const BROADCAST_MESSAGE_ADD = gql`
  mutation BROADCAST_ADD(
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

export const BROADCAST_REMOVE = gql`
  mutation BROADCAST_REMOVE($_ids: [String]) {
    engageMessageRemove(_ids: $_ids)
  }
`;

export const BROADCAST_SET_LIVE = gql`
  mutation BROADCAST_SET_LIVE($_id: String!) {
    engageMessageSetLive(_id: $_id) {
      _id
    }
  }
`;
