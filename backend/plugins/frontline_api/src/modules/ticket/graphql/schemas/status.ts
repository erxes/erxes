export const types = `

  type TicketStatus {
    _id: String!
    name: String!
    channelId: String!
    pipelineId: String
    description: String
    color: String
    order: Int
    type: Int
    createdAt: Date
    updatedAt: Date
  }

  type StatusSubscription {
    type: String
    status: TicketStatus
  }


`;

export const queries = `
  getTicketStatus(_id: String!): TicketStatus
  getTicketStatusesChoicesChannel(channelId: String!): JSON
  getTicketStatusesByType(channelId: String! , type: Int!): [TicketStatus]
`;

export const mutations = `
  addTicketStatus(
    name: String!
    channelId: String!
    pipelineId: String
    description: String
    color: String
    order: Int
    type: Int
  ): TicketStatus

  updateTicketStatus(
    _id: String!
    name: String
    description: String
    color: String
    order: Int
    type: Int
  ): TicketStatus

  deleteTicketStatus(_id: String!): JSON
`;
