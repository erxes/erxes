import { gql } from '@apollo/client';

export const GET_CONVERSATION_CONVERTED_ITEMS = gql`
  query ConversationConvertedItems($_id: String!) {
    conversationConvertedItems(_id: $_id) {
      _id
      type
      url
    }
  }
`;
