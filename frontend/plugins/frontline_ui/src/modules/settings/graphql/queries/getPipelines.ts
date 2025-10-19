import { gql } from '@apollo/client';

export const GET_TICKET_PIPELINES = gql`
  query GetTicketPipelines($filter: TicketsPipelineFilter) {
    getTicketPipelines(filter: $filter) {
      list {
        _id
        channelId
        createdAt
        description
        name
        updatedAt
        createdUser {
          _id
          details {
            avatar
            fullName
          }
        }
      }
      totalCount
    }
  }
`;
