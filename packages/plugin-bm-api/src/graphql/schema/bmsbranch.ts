import {
  attachmentType,
  attachmentInput,
} from '@erxes/api-utils/src/commonTypeDefs';

const posCommonFields = `
  name: String
  description: String
  user1Ids: [String]
  user2Ids: [String]
  paymentIds: [String]
  paymentTypes: [JSON]
  departmentId: String
  token: String
  erxesAppToken: String
  permissionConfig: JSON
  uiOptions: JSON
`;

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }
  type BmsBranch {
    _id: String
    createdAt: Date
    userId: String
    user: User
    ${posCommonFields}
  }
`;

export const queries = `
  bmsBranchList(page: Int, perPage: Int, sortField: String, sortDirection: Int): [BmsBranch]
  bmsBranchDetail(_id: String!): BmsBranch
`;

export const mutations = `
  bmsBranchAdd(${posCommonFields}): BmsBranch
  bmsBranchEdit(_id: String, ${posCommonFields}): BmsBranch
  bmsBranchRemove(_id: String!): JSON
`;
