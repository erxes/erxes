export const types = () => `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type LoansResearch {
    _id: String!
    createdAt: Date
    modifiedAt: Date
    apiUrl: String
    isLocalUser: Boolean
    userDN: String
    adminDN: String
    adminPassword: String
    code: String
  }

  type LoansResearchListResponse {
    list: [LoansResearch],
    totalCount: Int,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
`;

export const queries = `
  loansResearchMain(${queryParams}): LoansResearchListResponse
  loanResearchDetail(_id: String!): LoansResearch
`;

const commonFields = `
  apiUrl: String
  isLocalUser: Boolean
  userDN: String
  adminDN: String
  adminPassword: String
  code: String
`;

export const mutations = `
  loansResearchAdd(${commonFields}): LoansResearch
  loansResearchEdit(_id: String!, ${commonFields}): LoansResearch
  loansResearchRemove(loanResearchIds: [String]): [String]
`;
