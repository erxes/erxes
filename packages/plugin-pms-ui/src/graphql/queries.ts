export const branchCommonFields = `
  _id
  name
  description
  createdAt
  token
  erxesAppToken
  user1Ids
  user2Ids
  user3Ids
  user4Ids
  user5Ids
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
  pipelineConfig
`;

const tmsBranchDetail = `
  query tmsBranchDetail($_id: String!) {
    tmsBranchDetail(_id: $_id) {
      ${branchCommonFields}
    }
  }
`;

const tmBranchList = `
  query tmsBranchList(
    $sortField: String
    $sortDirection: Int
  ) {
    tmsBranchList(
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      ${branchCommonFields}
    }
  }
`;

export default {
  tmBranchList,
  tmsBranchDetail
};
