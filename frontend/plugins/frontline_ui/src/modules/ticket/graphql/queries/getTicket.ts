import { gql } from '~/gql';

export const GET_TICKET = gql(`
  query GetTicket($_id: String!) {
    getTicket(_id: $_id) {
      ...FrontlineTicketFields
      isSubscribed
      formResponses {
        _id
        formId
        formTitle
        submittedAt
        answers {
          fieldId
          label
          value
        }
      }
      sla {
        firstResponseDueAt
        resolutionDueAt
        firstRespondedAt
        resolvedAt
        firstResponseBreachedAt
        resolutionBreachedAt
      }
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
