import { gql } from '~/gql';

export const GET_CONVERSATION_MESSAGES = gql(`
  query InstagramConversationMessages(
    $conversationId: String!
    $getFirst: Boolean
    $skip: Int
    $limit: Int
  ) {
    instagramConversationMessages(
      conversationId: $conversationId
      getFirst: $getFirst
      skip: $skip
      limit: $limit
    ) {
      __typename
      _id
      content
      conversationId
      customerId
      userId
      createdAt
      isCustomerRead
      internal
      mid
      messageKind
      extraData
      providerData
      replyTo
      reactions
      deliveryStatus
      expiresAt
      attachments {
        url
        name
        type
        size
      }
    }
    instagramConversationMessagesCount(conversationId: $conversationId)
  }
`);
