import { gql } from '@apollo/client';

export const UPDATE_TICKET_MUTATION = gql`
  mutation UpdateTicket(
    $_id: String!
    $name: String
    $description: String
    $channelId: String
    $pipelineId: String
    $statusId: String
    $priority: Int
    $labelIds: [String]
    $tagIds: [String]
    $assigneeId: String
    $startDate: Date
    $targetDate: Date
    $isSubscribed: Boolean
  ) {
    updateTicket(
      _id: $_id
      name: $name
      description: $description
      channelId: $channelId
      pipelineId: $pipelineId
      statusId: $statusId
      priority: $priority
      labelIds: $labelIds
      tagIds: $tagIds
      assigneeId: $assigneeId
      startDate: $startDate
      targetDate: $targetDate
      isSubscribed: $isSubscribed
    ) {
      _id
    }
  }
`;
