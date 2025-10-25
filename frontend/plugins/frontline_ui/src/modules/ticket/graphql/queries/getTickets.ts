import { gql } from '@apollo/client';
import { GQL_PAGE_INFO } from 'erxes-ui';

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
      ${GQL_PAGE_INFO}
      totalCount
    }
  }
`;
