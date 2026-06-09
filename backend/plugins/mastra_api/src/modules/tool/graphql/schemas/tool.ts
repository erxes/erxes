export const types = `
  type MastraTool {
    _id: String
    toolId: String
    name: String
    description: String
    type: String
    builtinType: String
    erxesPlugin: String
    erxesOperation: String
    erxesOperationType: String
    graphqlArgs: JSON
    erxesReturnType: JSON
    erxesResponseFields: String
    isEnabled: Boolean
    createdAt: Date
  }

  input MastraToolInput {
    toolId: String
    name: String
    description: String
    type: String
    builtinType: String
    erxesPlugin: String
    erxesOperation: String
    erxesOperationType: String
    graphqlArgs: JSON
    erxesReturnType: JSON
    erxesResponseFields: String
    isEnabled: Boolean
  }

  type MastraErxesTool {
    plugin: String
    operation: String
    operationType: String
    description: String
    graphqlArgs: JSON
    returnType: JSON
  }

  type MastraAutoCreateResult {
    created: Int
    skipped: Int
    total: Int
  }
`;

export const queries = `
  mastraTools: [MastraTool]
  mastraTool(_id: String!): MastraTool
  mastraAvailableErxesTools: [MastraErxesTool]
`;

export const mutations = `
  mastraToolCreate(doc: MastraToolInput!): MastraTool
  mastraToolUpdate(_id: String!, doc: MastraToolInput!): MastraTool
  mastraToolRemove(_id: String!): JSON
  mastraAutoCreateTools: MastraAutoCreateResult
`;
