export const types = `
  type TdbConfig @key(fields: "_id") {
    _id: String
    name: String
    description: String
    apiUrl: String
    username: String
    testMode: Boolean
  }

  type TdbConfigListResponse {
    list: [TdbConfig]
    totalCount: Int
  }
`;

const mutationParams = `
    name: String!
    description: String
    apiUrl: String!
    username: String!
    password: String!
    testMode: Boolean
`;

export const mutations = `
  tdbConfigsAdd(${mutationParams}): TdbConfig
  tdbConfigsEdit(_id: String!, ${mutationParams}): TdbConfig
  tdbConfigsRemove(_id: String): JSON
`;

const qryParams = `
    page: Int
    perPage: Int
`;

export const queries = `
  tdbConfigsList(${qryParams}): TdbConfigListResponse
  tdbConfigs(${qryParams}): [TdbConfig]
  tdbConfigsDetail(_id: String!): TdbConfig
`;
