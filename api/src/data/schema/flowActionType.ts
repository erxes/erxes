export const types = `
  type FlowActionType {
    _id: String!
    type: String!
    name: String
    description: String
    createdAt: Date
  }
`;

export const queries = `
  flowActionTypes(page: Int, perPage: Int, searchValue: String): [FlowActionType]
  flowActionTypeDetail(_id: String!): FlowActionType
  flowActionTypesTotalCount: Int
  flowActionTypesGetLast: FlowActionType
`;

export const mutations = `
  flowActionTypesAdd(name: String!, description: String): FlowActionType
  flowActionTypesEdit(_id: String!, name: String!, description: String): FlowActionType
  flowActionTypesRemove(_id: String!): JSON
`;
