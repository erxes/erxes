import { gql } from '~/gql';

export const REMOVE_TICKET = gql(`
  mutation RemoveTicket($_id: [String!]!) {
    removeTicket(_id: $_id) {
      ok
      removedIds
    }
  }
`);
