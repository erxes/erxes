import { gql } from '@apollo/client';

export const MARK_AS_READ_CONVERSATION = gql`
  mutation ConversationMarkAsRead($id: String) {
    conversationMarkAsRead(_id: $id) {
      _id
    }
  }
`;
