import { gql } from '~/gql';

export const GET_TICKET = gql(`
  query GetTicket($_id: String!) {
    getTicket(_id: $_id) {
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
`);
