import { gql } from '~/gql';

export const GET_TICKETS = gql(`
  query GetTickets($filter: ITicketFilter) {
    getTickets(filter: $filter) {
      list {
        ...FrontlineTicketFields
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);
