import { gql } from '@apollo/client';

export const GET_TICKET = gql`
  query GetTicket($_id: String!) {
    getTicket(_id: $_id) {
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
    }
  }
`;
