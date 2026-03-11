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
    propertiesData: JSON
    state: String
    attachments: [Attachment]
  }
  type RemoveResponse {
    ok: Int!
    removedIds: [String!]!
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
    state: String
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
    state: String
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
  state: String
  attachments: [AttachmentInput]
`;

const updateTicketParams = `
  _id: String!
  name: String
  description: String
  channelId: String
  pipelineId: String
  statusId: String
  destinationStatusId: String
  priority: Int
  labelIds: [String]
  tagIds: [String]
  assigneeId: String
  startDate: Date
  targetDate: Date
  isSubscribed: Boolean
  propertiesData: JSON
  state: String
  attachments: [AttachmentInput]
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
  removeTicket(_id: [String!]!): RemoveResponse!
  cpCreateTicket(${createTicketParams}): Ticket
  cpUpdateTicket(${updateTicketParams}): Ticket
`;
