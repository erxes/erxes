import { gql } from '@apollo/client';

export const GET_TICKETS = gql`
  query GetTickets($filter: ITicketFilter) {
    getTickets(filter: $filter) {
      list {
        _id
        name
        description
        status
        priority
        labelIds
        tagIds
        assigneeId
        userId
        startDate
        targetDate
        createdAt
        updatedAt
        channelId
        statusChangedDate
        number
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
