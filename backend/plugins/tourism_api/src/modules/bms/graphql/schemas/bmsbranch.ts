import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

const commonFields = `
  name: String
  description: String
  generalManagerIds: [String]
  managerIds: [String]
  paymentIds: [String]
  paymentTypes: [JSON]
  departmentId: String
  token: String
  erxesAppToken: String
  permissionConfig: JSON
  uiOptions: JSON
`;

export const types = `

  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }
  type BmsBranch {
    _id: String!
    createdAt: Date
    userId: String
    user: User
    ${commonFields}
  }

  type BmsBranchListResponse {
    list: [BmsBranch]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const queries = `
  bmsBranches(page: Int, perPage: Int, sortField: String, sortDirection: Int): [BmsBranch]
  bmsBranchList(${GQL_CURSOR_PARAM_DEFS}): BmsBranchListResponse
  bmsBranchDetail(_id: String!): BmsBranch
`;

export const mutations = `
  bmsBranchAdd(${commonFields}): BmsBranch
  bmsBranchEdit(_id: String, ${commonFields}): BmsBranch
  bmsBranchRemove(_id: String!): JSON
`;
