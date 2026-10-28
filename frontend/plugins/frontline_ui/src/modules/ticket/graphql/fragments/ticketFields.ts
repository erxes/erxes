import { gql } from '~/gql';

export const TICKET_FIELDS = gql(`
  fragment FrontlineTicketFields on Ticket {
    _id
    name
    description
    statusId
    priority
    labelIds
    tagIds
    assigneeId
    assignedMembers
    userId
    startDate
    targetDate
    createdAt
    createdBy
    updatedAt
    channelId
    entityIds
    statusChangedDate
    number
    pipelineId
    state
    propertiesData
    customerId
    companyId
  }
`);
