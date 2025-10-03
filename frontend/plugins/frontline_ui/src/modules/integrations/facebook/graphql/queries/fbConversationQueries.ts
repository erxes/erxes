import { gql } from '@apollo/client';

const commonCommentAndMessageFields = `
  content
  conversationId
`;
export const GET_CONVERSATION_MESSAGES = gql`
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
    )
   {
      _id
      ${commonCommentAndMessageFields}
      customerId
      userId
      createdAt
      isCustomerRead
      internal
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
  query FacebookConversationMessagesCount($conversationId: String!) {
    facebookConversationMessagesCount(conversationId: $conversationId)
  }
`;

export const HAS_TAGGED_MESSAGES = gql`
  query FacebookHasTaggedMessages($conversationId: String!) {
    facebookHasTaggedMessages(conversationId: $conversationId)
  }
`;
