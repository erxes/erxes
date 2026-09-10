import { gql } from '@apollo/client';

export const GET_CONVERSATION_PINNED_MESSAGES = gql`
  query FrontlineConversationPinnedMessages($conversationId: String!) {
    conversationPinnedMessages(conversationId: $conversationId) {
      _id
      content
      createdAt
      attachments {
        url
        name
        type
        size
      }
      extraData
      providerData
    }
  }
`;
