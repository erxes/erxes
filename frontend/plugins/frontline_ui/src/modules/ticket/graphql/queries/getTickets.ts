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
        assignedMembers
        userId
        startDate
        targetDate
        createdAt
        createdBy
        updatedAt
        channelId
        branchId
        departmentId
        statusChangedDate
        number
        pipelineId
        state
        propertiesData
      }
      ${GQL_PAGE_INFO}
      totalCount
    }
  }
`;
