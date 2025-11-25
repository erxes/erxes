import { gql } from '@apollo/client';
import { GQL_PAGE_INFO } from 'erxes-ui';

export const GET_TICKETS = gql`
  query GetTickets($filter: ITicketFilter) {
    getTickets(filter: $filter) {
      list {
        _id
        name
        description
        statusId
        priority
        labelIds
        tagIds
        assigneeId
        userId
        startDate
        targetDate
        createdAt
        createdBy
        updatedAt
        channelId
        statusChangedDate
        number
        pipelineId
      }
      ${GQL_PAGE_INFO}
      totalCount
    }
  }
`;
