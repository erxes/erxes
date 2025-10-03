import { gql } from '@apollo/client';

export const CONVERSATION_ASSIGN = gql`
  mutation conversationsAssign(
    $conversationIds: [String]!
    $assignedUserId: String
  ) {
    conversationsAssign(
      conversationIds: $conversationIds
      assignedUserId: $assignedUserId
    ) {
      _id
    }
  }
`;
