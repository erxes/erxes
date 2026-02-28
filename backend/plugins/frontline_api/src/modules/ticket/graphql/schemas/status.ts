export const types = `

  type TicketStatus {
    _id: String!
    name: String!
    pipelineId: String!
    description: String
    color: String
    order: Int
    type: Int
    createdAt: Date
    updatedAt: Date
    visibilityType: String
    memberIds: [String]
    canMoveMemberIds: [String]
    canEditMemberIds: [String]
    departmentIds: [String]
    state: String
    probability: Float
  }

  type StatusSubscription {
    type: String
    status: TicketStatus
  }


`;

export const queries = `
  getTicketStatus(_id: String!): TicketStatus
  getTicketStatusesChoicesPipeline(pipelineId: String!): JSON
  getTicketStatusesByType(pipelineId: String! , type: Int!): [TicketStatus]
`;

const statusParams = `
  visibilityType: String
  memberIds: [String]
  canMoveMemberIds: [String]
  canEditMemberIds: [String]
  departmentIds: [String]
  state: String
  probability: Float
`;

export const mutations = `
  addTicketStatus(
    name: String!
    pipelineId: String!
    description: String
    color: String
    order: Int
    type: Int
    ${statusParams}
  ): TicketStatus

  updateTicketStatus(
    _id: String!
    name: String
    description: String
    color: String
    order: Int
    type: Int
    ${statusParams}
  ): TicketStatus

  deleteTicketStatus(_id: String!): JSON
`;
