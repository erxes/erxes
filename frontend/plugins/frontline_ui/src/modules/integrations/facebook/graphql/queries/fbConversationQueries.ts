import { gql } from '~/gql';

export const GET_CONVERSATION_MESSAGES = gql(`
  query FacebookConversationMessages(
    $conversationId: String!
    $getFirst: Boolean
    $skip: Int
    $limit: Int
  ) {
    facebookConversationMessages(
      conversationId: $conversationId
      getFirst: $getFirst
      skip: $skip
      limit: $limit
    ) {
      __typename
      _id
      mid
      content
      conversationId
      customerId
      userId
      fromBot
      createdAt
      isCustomerRead
      internal
      botData
      source
      messageKind
      providerData
      replyTo
      expiresAt
      reactions
      relatedMessage
      attachments {
        url
        name
        type
        size
      }
    }
    facebookConversationMessagesCount(conversationId: $conversationId)
  }
`);
