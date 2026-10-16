import { gql } from '~/gql';

export const DELETE_TICKET_NOTE = gql(`
  mutation TicketDeleteNote($id: String!) {
    ticketDeleteNote(_id: $id)
  }
`);
