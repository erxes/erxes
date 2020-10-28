import {
  commonDragParams,
  commonMutationParams,
  commonTypes,
  conformityQueryFields,
  copyParams
} from './common';

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
    closeDateType: String
    priority: [String]
    source: [String]
    labelIds: [String]
    sortField: String
    sortDirection: Int
    userIds: [String]
    ${conformityQueryFields}
  ): [Ticket]
  archivedTickets(pipelineId: String!, search: String, page: Int, perPage: Int): [Ticket]
  archivedTicketsCount(pipelineId: String!, search: String): Int
`;

const ticketMutationParams = `
  source: String,
`;

export const mutations = `
  ticketsAdd(name: String!, ${copyParams}, ${ticketMutationParams}, ${commonMutationParams}): Ticket
  ticketsEdit(_id: String!, name: String, ${ticketMutationParams}, ${commonMutationParams}): Ticket
  ticketsChange(${commonDragParams}): Ticket
  ticketsRemove(_id: String!): Ticket
  ticketsWatch(_id: String, isAdd: Boolean): Ticket
  ticketsCopy(_id: String!, proccessId: String): Ticket
  ticketsArchive(stageId: String!, proccessId: String): String
`;
