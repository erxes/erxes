export const types = `
  type GolomtBankConfig @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String
    name: String
    description: String
    consumerKey: String
    secretKey: String
  }

  type GolomtBankConfigListResponse {
    list: [GolomtBankConfig],
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
  golomtBankConfigsAdd(${mutationParams}): GolomtBankConfig
  golomtBankConfigsEdit(_id: String!, ${mutationParams}): GolomtBankConfig
  golomtBankConfigsRemove(_id: String): JSON
`;

const qryParams = `
    page: Int
    perPage: Int
`;

export const queries = `
  golomtBankConfigsList(${qryParams}): GolomtBankConfigListResponse
  golomtBankConfigs(${qryParams}): [GolomtBankConfig]
  golomtBankConfigsDetail(_id: String!): GolomtBankConfig
`;
