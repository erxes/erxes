const commonFields = `
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
  websiteReservationLock: Boolean
  time: String
  discount: JSON
  checkintime: String
  checkouttime: String
  checkinamount: Float
  checkoutamount: Float
`;

export const types = `
  type PmsBranch {
    _id: String
    createdAt: Date
    userId: String
    user: User
    ${commonFields}
  }
`;
export const queries = `
  pmsBranchList(page: Int, perPage: Int, sortField: String, sortDirection: Int): [PmsBranch]
  pmsBranchDetail(_id: String!): PmsBranch
`;

export const mutations = `
  pmsBranchAdd(${commonFields}): PmsBranch
  pmsBranchEdit(_id: String, ${commonFields}): PmsBranch
  pmsBranchRemove(_id: String!): JSON
`;
