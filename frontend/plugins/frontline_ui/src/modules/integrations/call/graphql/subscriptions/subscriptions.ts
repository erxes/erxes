import { gql } from '@apollo/client';

export const QUEUE_REALTIME_UPDATE = gql`
  subscription queueRealtimeUpdate($extension: String) {
    queueRealtimeUpdate(extension: $extension)
  }
`;

export const CALL_SESSION_UPDATED = gql`
  subscription callSessionUpdated(
    $inboxIntegrationId: String
    $uniqueid: String
    $extension: String
  ) {
    callSessionUpdated(
      inboxIntegrationId: $inboxIntegrationId
      uniqueid: $uniqueid
      extension: $extension
    ) {
      _id
      uniqueid
      inboxIntegrationId
      conversationId
      customerId
      customerPhone
      operatorPhone
      callType
      status
      queueName
      answeredBy
      answeredExtension
      startedAt
      answeredAt
      endedAt
      durationSec
      hangupCause
      source
      recordUrl
      diversion
      ringingOperators {
        userId
        extensionNumber
        state
        ringedAt
        answeredAt
      }
    }
  }
`;
