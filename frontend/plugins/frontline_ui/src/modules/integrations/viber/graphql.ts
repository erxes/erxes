import { gql } from '@apollo/client';

export const VIBER_MEDIA_SETTINGS = gql`
  query FrontlineViberMediaSettings {
    viberMediaSettings {
      hostnames
      source
    }
  }
`;

export const VIBER_UPDATE_MEDIA_SETTINGS = gql`
  mutation FrontlineViberUpdateMediaSettings($hostnames: [String!]) {
    viberUpdateMediaSettings(hostnames: $hostnames) {
      hostnames
      source
    }
  }
`;

export const VIBER_DELIVERY_FIELDS = gql`
  fragment FrontlineViberDeliveryFields on ConversationMessage {
    viberDelivery {
      _id
      state
      error
      parts {
        index
        type
        state
        error
        deliveredAt
        seenAt
        failedAt
      }
    }
  }
`;

export const VIBER_SETUP = gql`
  query FrontlineViberSetup {
    viberSetup {
      webhookUrl
      webhookError
      mediaHostnames
      mediaError
      storageProvider
      storageError
    }
  }
`;

export const VIBER_CONNECTION = gql`
  query FrontlineViberConnection($integrationId: String!) {
    viberConnection(integrationId: $integrationId) {
      integrationId
      botId
      name
      healthStatus
      error
      webhookUrl
    }
  }
`;

export const VIBER_REPAIR = gql`
  mutation FrontlineViberRepair($integrationId: String!) {
    integrationsRepair(_id: $integrationId, kind: "viber-messenger")
  }
`;

export const VIBER_UPDATE_TOKEN = gql`
  mutation FrontlineViberUpdateToken($integrationId: String!, $token: String!) {
    viberUpdateToken(integrationId: $integrationId, token: $token)
  }
`;

export const VIBER_CONVERSATION_STATE = gql`
  query FrontlineViberConversationState($conversationId: String!) {
    viberConversationState(conversationId: $conversationId) {
      canSend
      reason
      subscribed
    }
  }
`;

export const VIBER_SEND = gql`
  mutation FrontlineViberSend(
    $conversationId: String!
    $content: String
    $attachments: [AttachmentInput]
    $message: JSON
    $requestId: String!
  ) {
    viberSendMessage(
      conversationId: $conversationId
      content: $content
      attachments: $attachments
      message: $message
      requestId: $requestId
    ) {
      _id
      conversationId
      content
      extraData
      createdAt
      userId
      internal
      attachments {
        name
        url
        type
        size
      }
      ...FrontlineViberDeliveryFields
    }
  }
  ${VIBER_DELIVERY_FIELDS}
`;

export const VIBER_RETRY = gql`
  mutation FrontlineViberRetry($messageId: String!) {
    viberRetryMessage(messageId: $messageId) {
      _id
      extraData
      ...FrontlineViberDeliveryFields
    }
  }
  ${VIBER_DELIVERY_FIELDS}
`;

export const VIBER_STATUS = gql`
  query FrontlineViberMessageStatus($messageId: String!) {
    viberMessageStatus(messageId: $messageId) {
      _id
      state
      error
      parts {
        index
        type
        state
        error
        deliveredAt
        seenAt
        failedAt
      }
    }
  }
`;

export const VIBER_INTEGRATION_REFETCH = [
  'Integrations',
  'IntegrationDetail',
  'IntegrationsGetUsedTypes',
  'IntegrationsGetUsedTypesByChannel',
  'GetMyChannels',
  'FrontlineViberConnection',
];
export const VIBER_MESSAGE_REFETCH = [
  'ConversationMessages',
  'Conversations',
  'ConversationCounts',
  'FrontlineInboxSidebarWorkCounts',
  'FrontlineViberConversationState',
];
