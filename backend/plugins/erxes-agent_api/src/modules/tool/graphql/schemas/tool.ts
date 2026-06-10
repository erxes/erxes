export const types = `
  type MastraTool {
    _id: String
    toolId: String
    name: String
    description: String
    type: String
    builtinType: String
    erxesPlugin: String
    erxesModule: String
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
    erxesModule: String
    erxesOperation: String
    erxesOperationType: String
    graphqlArgs: JSON
    erxesReturnType: JSON
    erxesResponseFields: String
    isEnabled: Boolean
  }

  type MastraErxesTool {
    plugin: String
    module: String
    operation: String
    operationType: String
    description: String
    graphqlArgs: JSON
    returnType: JSON
  }

  type MastraAutoCreateResult {
    created: Int
    updated: Int
    removed: Int
    skipped: Int
    total: Int
  }

  type MastraToolListResponse {
    list: [MastraTool]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const queries = `
  mastraTools: [MastraTool]
  mastraToolsMain(page: Int, perPage: Int, searchValue: String, type: String): MastraToolListResponse
  mastraTool(_id: String!): MastraTool
  mastraAvailableErxesTools: [MastraErxesTool]
`;

export const mutations = `
  mastraToolCreate(doc: MastraToolInput!): MastraTool
  mastraToolUpdate(_id: String!, doc: MastraToolInput!): MastraTool
  mastraToolRemove(_id: String!): JSON
  mastraAutoCreateTools: MastraAutoCreateResult
`;
