import { gql } from '@apollo/client';

export const BROADCAST_MESSAGE_ADD = gql`
  mutation BROADCAST_ADD(
    $title: String
    $kind: String
    $method: String
    $fromUserId: String
    $fromEmail: String
    $cpId: String
    $targetType: String
    $targetIds: [String]
    $targetCount: Int
    $isDraft: Boolean
    $isLive: Boolean
    $email: EngageMessageEmail
    $messenger: EngageMessageMessenger
    $notification: EngageMessageNotification
    $workflow: JSON
  ) {
    engageMessageAdd(
      title: $title
      kind: $kind
      method: $method
      fromUserId: $fromUserId
      fromEmail: $fromEmail
      cpId: $cpId

      targetType: $targetType
      targetIds: $targetIds
      targetCount: $targetCount

      isDraft: $isDraft
      isLive: $isLive

      email: $email
      messenger: $messenger
      notification: $notification
      workflow: $workflow
    ) {
      _id
      workflowAutomationId
    }
  }
`;

export const BROADCAST_MESSAGE_EDIT = gql`
  mutation BROADCAST_EDIT(
    $_id: String!
    $title: String
    $kind: String
    $method: String
    $fromUserId: String
    $fromEmail: String
    $cpId: String
    $targetType: String
    $targetIds: [String]
    $targetCount: Int
    $isDraft: Boolean
    $isLive: Boolean
    $email: EngageMessageEmail
    $messenger: EngageMessageMessenger
    $notification: EngageMessageNotification
    $workflow: JSON
  ) {
    engageMessageEdit(
      _id: $_id
      title: $title
      kind: $kind
      method: $method
      fromUserId: $fromUserId
      fromEmail: $fromEmail
      cpId: $cpId

      targetType: $targetType
      targetIds: $targetIds
      targetCount: $targetCount

      isDraft: $isDraft
      isLive: $isLive

      email: $email
      messenger: $messenger
      notification: $notification
      workflow: $workflow
    ) {
      _id
      workflowAutomationId
    }
  }
`;

export const BROADCAST_SEND_TEST_EMAIL = gql`
  mutation BROADCAST_SEND_TEST_EMAIL(
    $from: String!
    $to: String!
    $contentJson: JSON
    $contentFormat: String
    $previewText: String
    $title: String!
  ) {
    engageMessageSendTestEmail(
      from: $from
      to: $to
      contentJson: $contentJson
      contentFormat: $contentFormat
      previewText: $previewText
      title: $title
    )
  }
`;

export const BROADCAST_UPDATE_CONFIGS = gql`
  mutation BROADCAST_UPDATE_CONFIGS($configsMap: JSON!) {
    broadcastUpdateConfigs(configsMap: $configsMap)
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

export const BROADCAST_COPY = gql`
  mutation BROADCAST_COPY($_id: String!) {
    engageMessageCopy(_id: $_id) {
      _id
      method
    }
  }
`;

export const BROADCAST_SET_PAUSE = gql`
  mutation BROADCAST_SET_PAUSE($_id: String!) {
    engageMessageSetPause(_id: $_id) {
      _id
      isLive
    }
  }
`;

export const BROADCAST_CANCEL_SCHEDULE = gql`
  mutation BROADCAST_CANCEL_SCHEDULE($_id: String!) {
    engageMessageCancelSchedule(_id: $_id) {
      _id
      isDraft
      isLive
      scheduleDate {
        type
        dateTime
      }
    }
  }
`;

export const BROADCAST_SET_SCHEDULE = gql`
  mutation BROADCAST_SET_SCHEDULE(
    $_id: String!
    $dateTime: Date
    $recurrence: EngageRecurrenceInput
  ) {
    engageMessageSetSchedule(
      _id: $_id
      dateTime: $dateTime
      recurrence: $recurrence
    ) {
      _id
      isDraft
      isLive
      scheduleDate {
        type
        dateTime
      }
    }
  }
`;
