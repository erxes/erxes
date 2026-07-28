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
        createdBy
        channelId
        statusChangedDate
        number
        pipelineId
        isSubscribed
        state
        propertiesData
        attachments {
          name
          url
          size
          type
          duration
        }
      }
    }
  }
`;
