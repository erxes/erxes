import { gql } from '~/gql';

export const GET_CONVERSATION_MESSAGES = gql(`
  query ConversationMessages(
    $conversationId: String!
    $skip: Int
    $limit: Int
    $getFirst: Boolean
  ) {
    conversationMessages(
      conversationId: $conversationId
      skip: $skip
      limit: $limit
      getFirst: $getFirst
    ) {
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
      fromBot
      botData
    }
    conversationMessagesTotalCount(conversationId: $conversationId)
  }
`);
