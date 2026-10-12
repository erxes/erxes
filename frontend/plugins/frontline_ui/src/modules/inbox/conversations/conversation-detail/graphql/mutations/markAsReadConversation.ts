import { gql } from '~/gql';

export const MARK_AS_READ_CONVERSATION = gql(`
  mutation ConversationMarkAsRead($id: String!) {
    conversationMarkAsRead(_id: $id) {
      __typename
      _id
    }
  }
`);
