export const types = `
  type FlowAction {
    _id: String!
    actionId: String!
    type: String!
    value: String!
    order: Int!
    flowId: String!
    createdAt: Date
    executeNext: Boolean!
  }
`;

export const queries = `
  flowActions(page: Int, perPage: Int, searchValue: String): [FlowAction]
  flowActionDetail(_id: String!): FlowAction
  flowActionsTotalCount: Int
  flowActionsGetLast: FlowAction
`;

export const mutations = `
  flowActionsAdd(name: String!, description: String): FlowAction
  flowActionsEdit(_id: String!, name: String!, description: String): FlowAction
  flowActionsRemove(_id: String!): JSON
`;
