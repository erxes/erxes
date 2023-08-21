import {
  commonDragParams,
  commonListTypes,
  commonMutationParams,
  commonTypes,
  conformityQueryFields,
  copyParams
} from './common';

export const types = ({ contacts, tags }) => `
  type TicketListItem {
    customPropertiesData:JSON,
    ${commonListTypes}
  }

  type Ticket @key(fields: "_id") {
    _id: String!
    source: String
    ${
      contacts
        ? `
      companies: [Company]
      customers: [Customer]
      `
        : ''
    }

    ${tags ? `tags: [Tag]` : ''}

    ${commonTypes}
  }
`;

const listQueryParams = `
  _ids: [String]
  pipelineId: String
  pipelineIds: [String]
  parentId:String
  stageId: String
  customerIds: [String]
  companyIds: [String]
  date: ItemDate
  skip: Int
  limit: Int
  search: String
  assignedUserIds: [String]
  closeDateType: String
  priority: [String]
  source: [String]
  labelIds: [String]
  sortField: String
  sortDirection: Int
  userIds: [String]
  segment: String
  segmentData: String
  assignedToMe: String
  startDate: String
  endDate: String
  hasStartAndCloseDate: Boolean
  tagIds: [String]
  noSkipArchive: Boolean
  number: String
  branchIds: [String]
  departmentIds: [String]
  boardIds: [String]
  stageCodes: [String]
  dateRangeFilters:JSON
  customFieldsDataFilters:JSON
  createdStartDate: Date,
  createdEndDate: Date
  stateChangedStartDate: Date
  stateChangedEndDate: Date
  startDateStartDate: Date
  startDateEndDate: Date
  closeDateStartDate: Date
  closeDateEndDate: Date
  ${conformityQueryFields}
`;

const archivedTicketsParams = `
  pipelineId: String!
  search: String
  userIds: [String]
  priorities: [String]
  assignedUserIds: [String]
  labelIds: [String]
  companyIds: [String]
  customerIds: [String]
  startDate: String
  endDate: String
  sources: [String]
`;

export const queries = `
  ticketDetail(_id: String!): Ticket
  tickets(${listQueryParams}): [TicketListItem]
  ticketsTotalCount(${listQueryParams}): Int
  archivedTickets(
    page: Int
    perPage: Int
    ${archivedTicketsParams}
  ): [Ticket]
  archivedTicketsCount(
    ${archivedTicketsParams}
  ): Int
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
