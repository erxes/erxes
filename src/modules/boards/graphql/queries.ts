const pipelineLabels = `
  query pipelineLabels($pipelineId: String!) {
    pipelineLabels(pipelineId: $pipelineId) {
      _id
      name
      colorCode
      pipelineId
      createdBy
      createdAt
    }
  }
`;

const pipelineLabelDetail = `
  query pipelineLabelDetail($_id: String!) {
    pipelineLabelDetail(_id: $_id) {
      _id
      name
      colorCode
      pipelineId
      createdBy
      createdAt
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
  query pipelines($boardId: String!) {
    pipelines(boardId: $boardId) {
      _id
      name
      boardId
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

const stages = `
  query stages(
    $isNotLost: Boolean,
    $pipelineId: String!,
    $search: String,	
    $customerIds: [String],	
    $companyIds: [String],	
    $assignedUserIds: [String],	
    $extraParams: JSON,
    $closeDateType: String
  ) {
    stages(
      isNotLost: $isNotLost,
      pipelineId: $pipelineId,
      search: $search,	
      customerIds: $customerIds,	
      companyIds: $companyIds,	
      assignedUserIds: $assignedUserIds,	
      extraParams: $extraParams,
      closeDateType: $closeDateType
    ) {
      _id
      name
      order
      amount
      itemsTotalCount
      compareNextStage
      initialDealsTotalCount
      stayedDealsTotalCount
      inProcessDealsTotalCount
      pipelineId
    }
  }
`;

const stageDetail = `
  query stageDetail($_id: String!) {
    stageDetail(_id: $_id) {
      _id
      name
      pipelineId
      amount
      itemsTotalCount
    }
  }
`;

export default {
  boards,
  boardGetLast,
  boardDetail,
  pipelines,
  pipelineDetail,
  stages,
  stageDetail,
  pipelineLabels,
  pipelineLabelDetail
};
