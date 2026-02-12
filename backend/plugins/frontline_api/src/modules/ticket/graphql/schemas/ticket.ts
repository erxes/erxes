import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_OFFSET_PARAM_DEFS,
} from 'erxes-api-shared/utils';

export const types = `

  type Ticket {
    _id: String
    name: String
    description: String
    pipelineId: String
    statusId: String
    priority: Int
    labelIds: [String]
    tagIds: [String]
    assigneeId: String
    createdBy: String
    userId: String
    startDate: Date
    targetDate: Date
    createdAt: Date
    updatedAt: Date
    channelId: String
    statusChangedDate: Date
    number: String
    status: TicketStatus
    assignee: User
    isSubscribed: Boolean
  }

  type TicketListResponse {
    list: [Ticket]
    pageInfo: PageInfo
    totalCount: Int
  }

  input ITicketFilter {
    _id: String
    statusId: String
    priority: Int
    pipelineId: String
    assigneeId: String
    createdBy: String
    labelIds: [String]
    tagIds: [String]
    startDate: Date
    targetDate: Date
    channelId: String
    userId: String
    name: String
    statusType: Int

    ${GQL_CURSOR_PARAM_DEFS}
  }

  input ICpTicketFilter {
    _id: String
    statusId: String
    priority: Int
    pipelineId: String
    assigneeId: String
    createdBy: String
    labelIds: [String]
    tagIds: [String]
    startDate: Date
    targetDate: Date
    channelId: String
    userId: String
    name: String
    statusType: Int

    ${GQL_OFFSET_PARAM_DEFS}
  }

  type TicketSubscription {
    type: String
    ticket: Ticket
  }
`;

const createTicketParams = `
  name: String!
  description: String
  channelId: String!
  pipelineId:String!
  statusId: String!
  priority: Int
  labelIds: [String]
  tagIds: [String]
  startDate: Date
  targetDate: Date
  assigneeId: String
`;

const updateTicketParams = `
  _id: String!
  name: String
  description: String
  channelId: String
  pipelineId: String
  statusId: String
  priority: Int
  labelIds: [String]
  tagIds: [String]
  assigneeId: String
  startDate: Date
  targetDate: Date
  isSubscribed: Boolean
`;

export const queries = `
  getTicket(_id: String!): Ticket
  getTickets(filter: ITicketFilter): TicketListResponse

  cpGetTickets(filter: ICpTicketFilter): [Ticket]
  cpGetTicket(_id: String!): Ticket
`;

export const mutations = `
  createTicket(${createTicketParams}): Ticket
  updateTicket(${updateTicketParams}): Ticket
  removeTicket(_id: String!): Ticket

  cpCreateTicket(${createTicketParams}): Ticket
`;
