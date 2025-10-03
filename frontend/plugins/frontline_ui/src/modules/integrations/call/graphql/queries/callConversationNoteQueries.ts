import { gql } from '@apollo/client';

const commonCommentAndMessageFields = `
  content
  conversationId
`;
export const getCallConversationNotes = gql`
  query callConversationNotes(
    $conversationId: String!
    $getFirst: Boolean
    $skip: Int
    $limit: Int
  ) {
    callConversationNotes(
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
