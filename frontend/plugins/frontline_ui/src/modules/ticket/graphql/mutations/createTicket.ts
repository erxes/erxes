import { gql } from '@apollo/client';

export const CREATE_TICKET = gql`
  mutation CreateTicket(
    $name: String!
    $statusId: String!
    $description: String
    $channelId: String!
    $pipelineId: String!
    $priority: Int
    $labelIds: [String]
    $tagIds: [String]
    $startDate: Date
    $targetDate: Date
    $assigneeId: String
  ) {
    createTicket(
      name: $name
      statusId: $statusId
      description: $description
      channelId: $channelId
      pipelineId: $pipelineId
      priority: $priority
      labelIds: $labelIds
      tagIds: $tagIds
      startDate: $startDate
      targetDate: $targetDate
      assigneeId: $assigneeId
    ) {
      _id
    }
  }
`;
