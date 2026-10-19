import { gql } from '~/gql';

export const TICKET_LIST_CHANGED = gql(`
  subscription ticketListChanged($filter: ITicketFilter) {
    ticketListChanged(filter: $filter) {
      type
      ticket {
        ...FrontlineTicketFields
      }
    }
  }
`);
