import { gql } from '~/gql';

export const TICKET_CHANGED = gql(`
  subscription ticketChanged($_id: String!) {
    ticketChanged(_id: $_id) {
      type
      ticket {
        ...FrontlineTicketFields
        isSubscribed
        attachments {
          name
          url
          size
          type
          duration
        }
      }
    }
  }
`);
