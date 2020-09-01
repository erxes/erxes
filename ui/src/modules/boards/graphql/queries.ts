const pipelineLabelFields = `
  _id
  name
  colorCode
  pipelineId
  createdBy
  createdAt
`;

const pipelineLabels = `
  query pipelineLabels($pipelineId: String!) {
    pipelineLabels(pipelineId: $pipelineId) {
      ${pipelineLabelFields}
    }
  }
`;

const pipelineLabelDetail = `
  query pipelineLabelDetail($_id: String!) {
    pipelineLabelDetail(_id: $_id) {
      ${pipelineLabelFields}
    }
  }
`;

const boards = `
  query boards($type: String!) {
    boards(type: $type) {
      _id
      name

      pipelines {
        _id
        name
      }
    }
  }
`;

const boardGetLast = `
  query boardGetLast($type: String!) {
    boardGetLast(type: $type) {
      _id
      name

      pipelines {
        _id
        name
      }
    }
  }
`;

const boardDetail = `
  query boardDetail($_id: String!) {
    boardDetail(_id: $_id) {
      _id
      name

      pipelines {
        _id
        name
        visibility
        memberIds
        isWatched
        startDate
        endDate
        state
        itemsTotalCount
        members {
          _id
          email
          username
          details {
            avatar
            fullName
          }
        }
      }
    }
  }
`;

const pipelines = `
  query pipelines($boardId: String, $type: String, $perPage: Int, $page: Int) {
    pipelines(boardId: $boardId, type: $type, perPage: $perPage, page: $page) {
      _id
      name
      boardId
      state
      startDate
      endDate
      itemsTotalCount
    }
  }
`;

const pipelineDetail = `
  query pipelineDetail($_id: String!) {
    pipelineDetail(_id: $_id) {
      _id
      name
      bgColor
      isWatched
      hackScoringType
    }
  }
`;

const commonParams = `
  $search: String,
  $customerIds: [String],
  $companyIds: [String],
  $assignedUserIds: [String],
  $labelIds: [String],
  $extraParams: JSON,
  $closeDateType: String
`;

const commonParamDefs = `
  search: $search,
  customerIds: $customerIds,
  companyIds: $companyIds,
  assignedUserIds: $assignedUserIds,
  labelIds: $labelIds,
  extraParams: $extraParams,
  closeDateType: $closeDateType
`;

const stageParams = `
  $isNotLost: Boolean,
  $pipelineId: String!,
  ${commonParams}
`;

const stageParamDefs = `
  isNotLost: $isNotLost,
  pipelineId: $pipelineId,
  ${commonParamDefs}
`;

const stageCommon = `
  _id
  name
  order
  amount
  itemsTotalCount
  pipelineId
`;

const stages = `
  query stages(
    ${stageParams}
  ) {
    stages(
      ${stageParamDefs}
    ) {
      ${stageCommon}
    }
  }
`;

const conversionStages = `
  query stages(
    ${stageParams}
  ) {
    stages(
      ${stageParamDefs}
    ) {
      ${stageCommon}
      compareNextStage
      initialDealsTotalCount
      stayedDealsTotalCount
      inProcessDealsTotalCount
    }
  }
`;

const archivedStages = `
  query archivedStages(
    $pipelineId: String!,
    $search: String,
    $page: Int,
    $perPage: Int,
  ) {
    archivedStages(
      pipelineId: $pipelineId,
      search: $search,
      page: $page,
      perPage: $perPage,
    ) {
      _id
      name
    }
  }
`;

const archivedStagesCount = `
  query archivedStagesCount(
    $pipelineId: String!,
    $search: String
  ) {
    archivedStagesCount(
      pipelineId: $pipelineId,
      search: $search
    )
  }
`;

const stageDetail = `
  query stageDetail(
    $_id: String!,
    ${commonParams}
  ) {
    stageDetail(
      _id: $_id,
      ${commonParamDefs}
    ) {
      _id
      name
      pipelineId
      amount
      itemsTotalCount
    }
  }
`;

const boardCounts = `
  query boardCounts($type: String!) {
    boardCounts(type: $type) {
      _id
      name
      count
    }
  }
`;

export default {
  archivedStages,
  archivedStagesCount,
  boards,
  boardGetLast,
  boardDetail,
  boardCounts,
  pipelines,
  pipelineDetail,
  stages,
  conversionStages,
  stageDetail,
  pipelineLabels,
  pipelineLabelDetail
};
