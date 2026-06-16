import { gql } from '@apollo/client';

const commonMessageFields = `
  content
  conversationId
`;

export const GET_WHATSAPP_CONVERSATION_MESSAGES = gql`
  query WhatsappConversationMessages(
    $conversationId: String!
    $getFirst: Boolean
    $skip: Int
    $limit: Int
  ) {
    whatsappConversationMessages(
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
