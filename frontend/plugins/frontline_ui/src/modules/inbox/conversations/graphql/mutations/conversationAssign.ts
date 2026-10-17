import { gql } from '~/gql';

export const CONVERSATION_ASSIGN = gql(`
  mutation conversationsAssign(
    $conversationIds: [String]!
    $assignedUserId: String
    $assignedUserIds: [String!]
  ) {
    conversationsAssign(
      conversationIds: $conversationIds
      assignedUserId: $assignedUserId
      assignedUserIds: $assignedUserIds
    ) {
      _id
      assignedUserId
      assignedUserIds
      assignedUsers {
        _id
        username
        email
        isActive
        details {
          avatar
          fullName
        }
      }
    }
  }
`);
