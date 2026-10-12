import { gql } from '@apollo/client';

export const conversationChanged = gql`
  subscription FrontlineLegacyConversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`;

export const CONVERSATION_CHANGED = gql`
  subscription conversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`;

const CONVERSATION_MESSAGE_FIELDS = gql`
  fragment FrontlineConversationMessageFields on ConversationMessage {
    _id
    mid
    messageKind
    providerData
    replyTo
    reactions
    deliveryStatus
    expiresAt
    conversationId
    content
    formWidgetData
    extraData
    attachments {
      url
      name
      type
      size
      duration
    }
    internal
    fromBot
    createdAt
    isCustomerRead
    userId
    customerId
    botData
    source
    relatedMessage
    fromBot
  }
`;

export const CONVERSATION_MESSAGE_INSERTED = gql`
  ${CONVERSATION_MESSAGE_FIELDS}
  subscription FrontlineConversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ...FrontlineConversationMessageFields
    }
  }
`;

export const CONVERSATION_MESSAGE_UPDATED = gql`
  ${CONVERSATION_MESSAGE_FIELDS}
  subscription FrontlineConversationMessageUpdated($_id: String!) {
    conversationMessageUpdated(_id: $_id) {
      ...FrontlineConversationMessageFields
    }
  }
`;

export const CONVERSATION_CLIENT_MESSAGE_INSERTED = gql`
  subscription conversationClientMessageInserted($userId: String!) {
    conversationClientMessageInserted(userId: $userId) {
      _id
      conversationId
      content
      createdAt
    }
  }
`;

export const CONVERSATION_UNREAD_COUNT_CHANGED = gql`
  subscription FrontlineConversationUnreadCountChanged {
    conversationUnreadCountChanged {
      conversationId
      channelId
      unreadConversationCount
    }
  }
`;

export const CONVERSATION_CLIENT_TYPING_STATUS_CHANGED = gql`
  subscription conversationClientTypingStatusChanged($_id: String!) {
    conversationClientTypingStatusChanged(_id: $_id) {
      conversationId
      customerId
      customerName
      text
    }
  }
`;

export const CONVERSATION_EXTERNAL_INTEGRATION_MESSAGE_INSERTED = gql`
  subscription conversationExternalIntegrationMessageInserted {
    conversationExternalIntegrationMessageInserted
  }
`;

const customerConnectionChanged = `
  subscription customerConnectionChanged ($_id: String!) {
    customerConnectionChanged (_id: $_id) {
      _id
      status
    }
  }
`;

export const inboxSubscriptions = {
  conversationChanged,
  conversationClientTypingStatusChanged:
    CONVERSATION_CLIENT_TYPING_STATUS_CHANGED,
  customerConnectionChanged,
};
