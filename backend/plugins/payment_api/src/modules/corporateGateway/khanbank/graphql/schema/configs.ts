export const types = `

  type KhanbankConfig @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String
    name: String
    description: String

    consumerKey: String
    secretKey: String
  }

  type KhanbankConfigListResponse {
    list: [KhanbankConfig],
    totalCount: Int
  }
`;

const mutationParams = `
    name: String!
    description: String

    consumerKey: String!
    secretKey: String!
`;

export const mutations = `
  khanbankConfigsAdd(${mutationParams}): KhanbankConfig
  khanbankConfigsEdit(_id: String!, ${mutationParams}): KhanbankConfig
  khanbankConfigsRemove(_id: String): JSON
`;

const qryParams = `
    page: Int
    perPage: Int
`;

export const queries = `
  khanbankConfigsList(${qryParams}): KhanbankConfigListResponse
  khanbankConfigs(${qryParams}): [KhanbankConfig]
  khanbankConfigsDetail(_id: String!): KhanbankConfig
`;
