import { gql } from '@apollo/client';

export const TICKET_LIST_CHANGED = gql`
  subscription ticketListChanged($filter: ITicketFilter) {
    ticketListChanged(filter: $filter) {
      type
      ticket {
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
        updatedAt
        channelId
        statusChangedDate
        number
        pipelineId
      }
    }
  }
`;
