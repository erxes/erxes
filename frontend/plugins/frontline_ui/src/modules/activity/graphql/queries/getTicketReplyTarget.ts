import { gql } from '@apollo/client';

export const GET_TICKET_REPLY_TARGET = gql`
  query MailTicketReplyTarget($ticketId: String!) {
    mailTicketReplyTarget(ticketId: $ticketId) {
      from
      to
    }
  }
`;
