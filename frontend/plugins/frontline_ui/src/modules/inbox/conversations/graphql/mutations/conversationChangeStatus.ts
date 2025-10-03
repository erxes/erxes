import { gql } from '@apollo/client';

export const CONVERSATION_CHANGE_STATUS = gql`
  mutation ConversationsChangeStatus($ids: [String]!, $status: String!) {
    conversationsChangeStatus(_ids: $ids, status: $status) {
      _id
    }
  }
`;
