import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

const posCommonFields = `
  name: String
  description: String
  user1Ids: [String]
  user2Ids: [String]
  user3Ids: [String]
  user4Ids: [String]
  user5Ids: [String]

  paymentIds: [String]
  paymentTypes: [JSON]
  departmentId: String
  token: String
  erxesAppToken: String
  permissionConfig: JSON
  uiOptions: JSON
  pipelineConfig: JSON
`;

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type TmsBranch {
    _id: String
    createdAt: Date
    userId: String
    user: User
    ${posCommonFields}
  }
`;

export const queries = `
  tmsBranchList(page: Int, perPage: Int, sortField: String, sortDirection: Int): [TmsBranch]
  tmsBranchDetail(_id: String!): TmsBranch
`;

export const mutations = `
  tmsBranchAdd(${posCommonFields}): TmsBranch
  tmsBranchEdit(_id: String, ${posCommonFields}): TmsBranch
  tmsBranchRemove(_id: String!): JSON
`;
