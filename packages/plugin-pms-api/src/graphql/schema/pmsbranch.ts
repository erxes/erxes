import {
  attachmentType,
  attachmentInput,
} from "@erxes/api-utils/src/commonTypeDefs";

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
  extraProductCategories: JSON
  roomCategories: JSON
  time: String
  discount: JSON
  checkintime: String
  checkouttime: String
  checkinamount: Float
  checkoutamount: Float


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

  type PmsBranch {
    _id: String
    createdAt: Date
    userId: String
    user: User
    ${posCommonFields}
  }
`;

export const queries = `
  pmsBranchList(page: Int, perPage: Int, sortField: String, sortDirection: Int): [PmsBranch]
  pmsBranchDetail(_id: String!): PmsBranch
`;

export const mutations = `
  pmsBranchAdd(${posCommonFields}): PmsBranch
  pmsBranchEdit(_id: String, ${posCommonFields}): PmsBranch
  pmsBranchRemove(_id: String!): JSON
`;
