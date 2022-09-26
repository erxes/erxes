// Settings

const configs = `
  query configs {
    configs {
      _id
      code
      value
    }
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
`;

const commonOrderParams = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int,
  $createdStartDate: Date
  $createdEndDate: Date
`;

const commonOrderParamDefs = `
  page: $page,
  perPage: $perPage,
  sortField: $sortField
  sortDirection: $sortDirection
  createdStartDate: $createdStartDate
  createdEndDate: $createdEndDate
`;

const commonProductParams = `
  $type: String,
  $categoryId: String,
  $searchValue: String,
  $tag: String,
  $page: Int,
  $perPage: Int, 
  $ids: [String],
  $excludeIds: Boolean,
  $pipelineId: String,
  $boardId: String
`;

const commonProductParamsDefs = `
  type: $type,
  categoryId: $categoryId,
  searchValue: $searchValue,
  tag: $tag,
  page: $page,
  perPage: $perPage, 
  ids: $ids,
  excludeIds: $excludeIds,
  pipelineId: $pipelineId,
  boardId: $boardId 
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
