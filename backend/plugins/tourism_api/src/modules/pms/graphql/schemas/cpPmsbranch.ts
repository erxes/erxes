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
  extraProductCategories: [String]
  excludeExtraProductCategoryIds: [String]
  excludeExtraProductIds: [String]
  roomCategories: [String]
  excludeRoomCategoryIds: [String]
  excludeRoomIds: [String]
  hasAppointment: Boolean
  appointmentCategories: [String]
  excludeAppointmentCategoryIds: [String]
  excludeAppointmentIds: [String]
  time: String
  discount: JSON
  checkintime: String
  checkouttime: String
  checkinamount: Float
  checkoutamount: Float
`;

export const types = `
  type cpPmsBranch {
    _id: String
    createdAt: Date
    userId: String
    user: User
    ${commonFields}
  }
`;
export const queries = `
  cpPmsBranchList(page: Int, perPage: Int, sortField: String, sortDirection: Int): [cpPmsBranch]
  cpPmsBranchDetail(_id: String!): cpPmsBranch
`;
