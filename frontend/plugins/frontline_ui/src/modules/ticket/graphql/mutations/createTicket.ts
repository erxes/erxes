import { gql } from '~/gql';

export const CREATE_TICKET = gql(`
  mutation CreateTicket(
    $name: String!
    $statusId: String!
    $description: String
    $channelId: String!
    $pipelineId: String!
    $priority: Int
    $branchId: String
    $departmentId: String
    $labelIds: [String]
    $tagIds: [String]
    $startDate: Date
    $targetDate: Date
    $assigneeId: String
    $assignedMembers: [String]
    $attachments: [AttachmentInput]
    $customerIds: [String]
    $companyIds: [String]
  ) {
    createTicket(
      name: $name
      statusId: $statusId
      description: $description
      channelId: $channelId
      pipelineId: $pipelineId
      priority: $priority
      branchId: $branchId
      departmentId: $departmentId
      labelIds: $labelIds
      tagIds: $tagIds
      startDate: $startDate
      targetDate: $targetDate
      assigneeId: $assigneeId
      assignedMembers: $assignedMembers
      attachments: $attachments
      customerIds: $customerIds
      companyIds: $companyIds
    ) {
      ...FrontlineTicketFields
    }
  }
`);
