import { gql } from '@apollo/client';

export const DELETE_TICKET_STATUS = gql`
  mutation DeleteTicketStatus($id: String!) {
    deleteTicketStatus(_id: $id)
  }
`;
