// Settings

const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

const commonDealParams = `
  $skip: Int,
  $limit: Int,
  $sortField: String,
  $sortDirection: Int,
  $userIds: [String],
  $pipelineId: String
  $stageId: String
  $stageChangedStartDate: Date
  $stageChangedEndDate: Date
  $noSkipArchive: Boolean
  $assignedUserIds: [String],
  $productIds: [String],
  $search: String
  $number: String
`;

const commonDealParamDefs = `
  skip: $skip,
  limit: $limit,
  sortField: $sortField
  sortDirection: $sortDirection
  userIds: $userIds
  pipelineId: $pipelineId
  stageId: $stageId
  stageChangedStartDate: $stageChangedStartDate
  stageChangedEndDate: $stageChangedEndDate
  noSkipArchive: $noSkipArchive
  assignedUserIds: $assignedUserIds,
  productIds: $productIds,
  search: $search,
  number: $number,
`;

const commonOrderParams = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int,
  $posToken: String,
  $search: String,
  $posId: String,
  $userId: String,
  $paidStartDate: Date,
  $paidEndDate: Date,
  $createdStartDate: Date,
  $createdEndDate: Date,
`;

const commonOrderParamDefs = `
  page: $page,
  perPage: $perPage,
  sortField: $sortField,
  sortDirection: $sortDirection,
  posToken: $posToken,
  search: $search,
  posId: $posId,
  userId: $userId,
  createdStartDate: $createdStartDate,
  createdEndDate: $createdEndDate,
  paidStartDate: $paidStartDate,
  paidEndDate: $paidEndDate,
`;

const checkSyncDeals = `
  query deals (
    ${commonDealParams}
  ) {
    deals (
      ${commonDealParamDefs}
    ) {
      _id
      name
      amount
      assignedUsers
      modifiedAt
      number
      createdAt
      stageChangedDate
    }
  }
`;

const checkSyncDealsTotalCount = `
  query dealsTotalCount (
    ${commonDealParams}
  ) {
    dealsTotalCount (
      ${commonDealParamDefs}
    )
  }
`;
const checkSyncOrdersTotalCount = `
  query ordersTotalCount (
    ${commonOrderParams}
  ) {
    posOrdersTotalCount (
      ${commonOrderParamDefs}
    )
  }
`;
const checkSyncOrders = `
  query PosOrders(
    ${commonOrderParams}
  ) {
    posOrders (
      ${commonOrderParamDefs}
    ) {
      _id
      number
      createdAt
      paidDate
      totalAmount
    }
  }
`;

export default {
  configs,
  checkSyncDeals,
  checkSyncDealsTotalCount,
  checkSyncOrdersTotalCount,
  checkSyncOrders
};
