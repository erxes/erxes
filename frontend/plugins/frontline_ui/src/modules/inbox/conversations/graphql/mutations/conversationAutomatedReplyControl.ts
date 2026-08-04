import { gql } from '@apollo/client';

export const CONVERSATION_SET_AUTOMATED_REPLY_CONTROL = gql`
  mutation ConversationSetAutomatedReplyControl(
    $_id: String!
    $status: String!
    $reason: String
  ) {
    conversationSetAutomatedReplyControl(
      _id: $_id
      status: $status
      reason: $reason
    ) {
      _id
      automatedReplyControl
    }
  }
`;
