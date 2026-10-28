import { gql } from '~/gql';

export const UPDATE_TICKET_MUTATION = gql(`
  mutation UpdateTicket(
    $_id: String!
    $name: String
    $description: String
    $channelId: String
    $pipelineId: String
    $statusId: String
    $priority: Int
    $entityIds: [String]
    $labelIds: [String]
    $tagIds: [String]
    $assigneeId: String
    $assignedMembers: [String]
    $startDate: Date
    $targetDate: Date
    $isSubscribed: Boolean
    $propertiesData: JSON
    $state: String
    $attachments: [AttachmentInput]
  ) {
    updateTicket(
      _id: $_id
      name: $name
      description: $description
      channelId: $channelId
      pipelineId: $pipelineId
      statusId: $statusId
      priority: $priority
      entityIds: $entityIds
      labelIds: $labelIds
      tagIds: $tagIds
      assigneeId: $assigneeId
      assignedMembers: $assignedMembers
      startDate: $startDate
      targetDate: $targetDate
      isSubscribed: $isSubscribed
      propertiesData: $propertiesData
      state: $state
      attachments: $attachments
    ) {
      _id
      name
      description
      statusId
      priority
      entityIds
      labelIds
      tagIds
      assigneeId
      assignedMembers
      startDate
      targetDate
      channelId
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
`);
