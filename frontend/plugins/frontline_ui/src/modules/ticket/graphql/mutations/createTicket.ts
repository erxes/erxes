import { gql } from '@apollo/client';

export const CREATE_TICKET = gql`
  mutation CreateTicket(
    $name: String!
    $channelId: String!
    $description: String
    $status: String
    $priority: Int
    $labelIds: [String]
    $tagIds: [String]
    $startDate: Date
    $targetDate: Date
    $assigneeId: String
  ) {
    createTicket(
      name: $name
      channelId: $channelId
      description: $description
      status: $status
      priority: $priority
      labelIds: $labelIds
      tagIds: $tagIds
      startDate: $startDate
      targetDate: $targetDate
      assigneeId: $assigneeId
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
