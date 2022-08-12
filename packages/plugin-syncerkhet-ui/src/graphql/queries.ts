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

const commonParams = `
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

const commonParamDefs = `
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

const checkSyncDeals = `
  query deals (
    ${commonParams}
  ) {
    deals (
      ${commonParamDefs}
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
    ${commonParams}
  ) {
    dealsTotalCount (
      ${commonParamDefs}
    )
  }
`;

export default {
  configs,
  checkSyncDeals,
  checkSyncDealsTotalCount
};
