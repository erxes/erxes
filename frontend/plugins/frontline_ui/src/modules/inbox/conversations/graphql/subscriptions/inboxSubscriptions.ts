import { gql } from '~/gql';

export const CONVERSATION_CHANGED = gql(`
  subscription conversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`);

export const CONVERSATION_MESSAGE_FIELDS = gql(`
  fragment FrontlineConversationMessageFields on ConversationMessage {
    _id
    mid
    messageKind
    providerData {
      messageId
      attachmentType
      fallbackReason
      previewText
      previewUrl
      shareType
      storyUrl
    }
    replyTo {
      messageId
      content
      authorName
    }
    reactions {
      senderId
      emoji
      reaction
    }
    deliveryStatus
    expiresAt
    conversationId
    content
    contentType
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
`);

export const CONVERSATION_MESSAGE_INSERTED = gql(`
  subscription FrontlineConversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ...FrontlineConversationMessageFields
    }
  }
`);

export const CONVERSATION_MESSAGE_UPDATED = gql(`
  subscription FrontlineConversationMessageUpdated($_id: String!) {
    conversationMessageUpdated(_id: $_id) {
      ...FrontlineConversationMessageFields
    }
  }
`);

export const CONVERSATION_CLIENT_MESSAGE_INSERTED = gql(`
  subscription conversationClientMessageInserted($userId: String!) {
    conversationClientMessageInserted(userId: $userId) {
      _id
      conversationId
      content
      createdAt
      internal
      contentType
      messageKind
      providerData { messageId attachmentType fallbackReason previewText previewUrl shareType storyUrl }
      extraData
      attachments { name type url }
    }
  }
`);

export const CONVERSATION_UNREAD_COUNT_CHANGED = gql(`
  subscription FrontlineConversationUnreadCountChanged {
    conversationUnreadCountChanged {
      conversationId
      channelId
      unreadConversationCount
    }
  }
`);

export const CONVERSATION_CLIENT_TYPING_STATUS_CHANGED = gql(`
  subscription conversationClientTypingStatusChanged($_id: String!) {
    conversationClientTypingStatusChanged(_id: $_id) {
      conversationId
      customerId
      customerName
      text
    }
  }
`);
