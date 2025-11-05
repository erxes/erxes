import { gql } from '@apollo/client';

export const TICKET_CHANGED = gql`
  subscription ticketChanged($_id: String!) {
    ticketChanged(_id: $_id) {
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
