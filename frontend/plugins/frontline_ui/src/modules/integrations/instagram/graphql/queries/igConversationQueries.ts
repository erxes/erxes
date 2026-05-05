import { gql } from '@apollo/client';

const commonMessageFields = `
  content
  conversationId
`;

export const GET_CONVERSATION_MESSAGES = gql`
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
      _id
      ${commonMessageFields}
      customerId
      userId
      createdAt
      isCustomerRead
      internal
      mid
      attachments {
        url
        name
        type
        size
      }
    }
  }
`;

export const GET_CONVERSATION_MESSAGES_COUNT = gql`
  query InstagramConversationMessagesCount($conversationId: String!) {
    instagramConversationMessagesCount(conversationId: $conversationId)
  }
`;

export const HAS_TAGGED_MESSAGES = gql`
  query InstagramHasTaggedMessages($conversationId: String!) {
    instagramHasTaggedMessages(conversationId: $conversationId)
  }
`;

export const GET_POST_MESSAGES = gql`
  query InstagramPostMessages(
    $conversationId: String!
    $getFirst: Boolean
    $skip: Int
    $limit: Int
  ) {
    instagramPostMessages(
      conversationId: $conversationId
      getFirst: $getFirst
      skip: $skip
      limit: $limit
    ) {
      _id
      ${commonMessageFields}
      customerId
      userId
      createdAt
      commentId
      attachments {
        url
        name
        type
        size
      }
    }
  }
`;
