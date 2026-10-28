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
    $branchId: String
    $departmentId: String
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
      branchId: $branchId
      departmentId: $departmentId
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
      branchId
      departmentId
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
