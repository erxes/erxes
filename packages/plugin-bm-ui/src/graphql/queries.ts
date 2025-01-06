export const branchCommonFields = `
  _id
  name
  description
  createdAt
  token
  erxesAppToken
  user1Ids
  user2Ids
  paymentIds
  paymentTypes
  user {
    _id
    details {
      avatar
      fullName
    }
  }
  uiOptions
  permissionConfig
`;

const bmsBranchDetail = `
  query bmsBranchDetail($_id: String!) {
    bmsBranchDetail(_id: $_id) {
      ${branchCommonFields}
    }
  }
`;

const bmBranchList = `
  query bmsBranchList(
    $sortField: String
    $sortDirection: Int
  ) {
    bmsBranchList(
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      ${branchCommonFields}
    }
  }
`;

export default {
  bmBranchList,
  bmsBranchDetail,
};
