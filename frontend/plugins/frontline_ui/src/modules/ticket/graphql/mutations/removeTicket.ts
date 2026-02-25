import { gql } from '@apollo/client';

export const REMOVE_TICKET = gql`
  mutation RemoveTicket($_id: String!) {
    removeTicket(_id: $_id) {
      _id
    }
  }
`;
