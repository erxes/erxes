import { commonTypes, conformityQueryFields } from './common';

export const types = `
  type Ticket {
    _id: String!
    source: String
    companies: [Company]
    customers: [Customer]
    ${commonTypes}
  }
`;

export const queries = `
  ticketDetail(_id: String!): Ticket
  tickets(
    pipelineId: String
    stageId: String
    customerIds: [String]
    companyIds: [String]
    date: ItemDate
    skip: Int
    search: String
    assignedUserIds: [String]
    nextDay: String
    nextWeek: String
    nextMonth: String
    noCloseDate: String
    overdue: String
    priority: [String]
    source: [String]
    labelIds: [String]
    ${conformityQueryFields}
  ): [Ticket]
`;

const commonParams = `
  name: String,
  stageId: String,
  assignedUserIds: [String],
  attachments: [AttachmentInput],
  closeDate: Date,
  description: String,
  order: Int,
  priority: String,
  source: String,
  reminderMinute: Int,
  isComplete: Boolean
`;

export const mutations = `
  ticketsAdd(name: String!, ${commonParams}): Ticket
  ticketsEdit(_id: String!, name: String, ${commonParams}): Ticket
  ticketsChange( _id: String!, destinationStageId: String): Ticket
  ticketsUpdateOrder(stageId: String!, orders: [OrderItem]): [Ticket]
  ticketsRemove(_id: String!): Ticket
  ticketsWatch(_id: String, isAdd: Boolean): Ticket
`;
