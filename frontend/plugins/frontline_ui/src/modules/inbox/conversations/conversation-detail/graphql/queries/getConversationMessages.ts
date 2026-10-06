import { gql } from '@apollo/client';

export const GET_CONVERSATION_MESSAGES = gql`
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
      fromBot
      botData
    }
    conversationMessagesTotalCount(conversationId: $conversationId)
  }
`;
