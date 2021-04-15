export const types = `
  type Flow {
    _id: String!
    name: String
    description: String
    actions: [FlowAction]
    integrations: [Integration]
    assignedUserId: String
    createdAt: Date
  }
`;

export const queries = `
  flows(page: Int, perPage: Int, searchValue: String): [Flow]
  flowDetail(_id: String!): Flow
  flowsTotalCount: Int
  flowsGetLast: Flow
`;

export const mutations = `
  flowsAdd(name: String!, description: String): Flow
  flowsEdit(_id: String!, name: String!, description: String): Flow
  flowsRemove(_id: String!): JSON
  flowsManageIntegrations(_id: String!, integrationIds: [String]!): [Integration]
`;
