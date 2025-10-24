import { gql } from '@apollo/client';

export const GET_TICKET = gql`
  query GetTicket($id: String!) {
    getTicket(_id: $id) {
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
`;
