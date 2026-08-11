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
    $assigneeIds: [String]
    $assignedMembers: [String]
    $attachments: [AttachmentInput]
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
      assigneeIds: $assigneeIds
      assignedMembers: $assignedMembers
      attachments: $attachments
    ) {
      _id
      name
      description
      statusId
      priority
      labelIds
      tagIds
      assigneeIds
      assignedMembers
      userId
      startDate
      targetDate
      createdAt
      createdBy
      updatedAt
      channelId
      statusChangedDate
      number
      pipelineId
      state
    }
  }
`;
