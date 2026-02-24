import { gql } from '@apollo/client';

export const REMOVE_TICKET = gql`
  mutation RemoveTicket($id: String!) {
    removeTicket(_id: $id) {
      _id
    }
  }
`;
