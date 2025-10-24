import { gql } from '@apollo/client';

export const UPDATE_TICKET = gql`
  mutation UpdateTicket(
    $id: String!
    $name: String
    $description: String
    $channelId: String
    $status: String
    $priority: Int
    $labelIds: [String]
    $tagIds: [String]
    $assigneeId: String
    $startDate: Date
    $targetDate: Date
  ) {
    updateTicket(
      _id: $id
      name: $name
      description: $description
      channelId: $channelId
      status: $status
      priority: $priority
      labelIds: $labelIds
      tagIds: $tagIds
      assigneeId: $assigneeId
      startDate: $startDate
      targetDate: $targetDate
    ) {
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
