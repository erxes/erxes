import { gql } from '~/gql';

export const CREATE_TICKET = gql(`
  mutation CreateTicket(
    $name: String!
    $statusId: String!
    $description: String
    $channelId: String!
    $pipelineId: String!
    $priority: Int
    $entityIds: [String]
    $labelIds: [String]
    $tagIds: [String]
    $startDate: Date
    $targetDate: Date
    $assigneeId: String
    $assignedMembers: [String]
    $attachments: [AttachmentInput]
    $propertiesData: JSON
    $customerId: String
    $companyId: String
  ) {
    createTicket(
      name: $name
      statusId: $statusId
      description: $description
      channelId: $channelId
      pipelineId: $pipelineId
      priority: $priority
      entityIds: $entityIds
      labelIds: $labelIds
      tagIds: $tagIds
      startDate: $startDate
      targetDate: $targetDate
      assigneeId: $assigneeId
      assignedMembers: $assignedMembers
      attachments: $attachments
      propertiesData: $propertiesData
      customerId: $customerId
      companyId: $companyId
    ) {
      ...FrontlineTicketFields
    }
  }
`);
