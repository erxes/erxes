import { gql } from '@apollo/client';

export const GET_TICKET_NOTE = gql`
  query TicketGetNote($id: String!) {
    ticketGetNote(_id: $id) {
      _id
      content
      contentId
      createdBy
      mentions
      createdAt
      updatedAt
    }
  }
`;
