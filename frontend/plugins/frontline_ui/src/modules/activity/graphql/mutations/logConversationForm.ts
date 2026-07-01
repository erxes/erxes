import { gql } from '@apollo/client';

export const TICKET_LOG_CONVERSATION_FORM = gql`
  mutation ticketLogConversationForm(
    $ticketId: String!
    $conversationId: String!
  ) {
    ticketLogConversationForm(
      ticketId: $ticketId
      conversationId: $conversationId
    )
  }
`;
