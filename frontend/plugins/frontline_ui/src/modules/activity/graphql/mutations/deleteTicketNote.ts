import { gql } from '@apollo/client';

export const DELETE_TICKET_NOTE = gql`
  mutation TicketDeleteNote($id: String!) {
    ticketDeleteNote(_id: $id)
  }
`;
