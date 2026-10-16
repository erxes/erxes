import { gql } from '~/gql';

export const CONVERSATION_ASSIGN = gql(`
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
`);
