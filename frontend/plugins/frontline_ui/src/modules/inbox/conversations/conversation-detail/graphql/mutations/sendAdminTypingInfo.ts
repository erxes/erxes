import { gql } from '@apollo/client';

export const CONVERSATIONS_ADMIN_SEND_TYPING_INFO = gql`
  mutation conversationsAdminSendTypingInfo(
    $conversationId: String!
    $text: String
  ) {
    conversationsAdminSendTypingInfo(
      conversationId: $conversationId
      text: $text
    )
  }
`;
