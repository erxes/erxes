export const types = `
  type GolomtBankConfig {
    _id: String
    name: String
    organizationName: String
    clientId: String
    ivKey: String
    sessionKey: String
    configPassword: String
    registerId: String
    accountId: String
    golomtCode: String
    apiUrl: String
  }

  type GolomtBankConfigListResponse {
    list: [GolomtBankConfig],
    totalCount: Int
  }
`;

const mutationParams = `
    name: String
    organizationName: String
    clientId: String
    ivKey: String
    sessionKey: String
    configPassword: String
    registerId: String
    accountId: String
    golomtCode: String
    apiUrl: String
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
