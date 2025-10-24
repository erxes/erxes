import { gql } from '@apollo/client';

export const TICKET_LIST_CHANGED = gql`
  subscription ticketListChanged() {
    ticketListChanged {
      type
      ticket {
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
    }
  }
`;
