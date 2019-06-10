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
    }
  }
`;

const stages = `
  query stages(
    $modelName: String!,
    $pipelineId: String!, 
    $search: String,
    $customerIds: [String],
    $companyIds: [String],
    $assignedUserIds: [String],
    $nextDay: String,
    $nextWeek: String,
    $nextMonth: String,
    $noCloseDate: String,
    $overdue: String
    $productIds: [String]
  ) {
    stages(
      modelName: $modelName,
      pipelineId: $pipelineId, 
      search: $search,
      customerIds: $customerIds,
      companyIds: $companyIds,
      assignedUserIds: $assignedUserIds,
      nextDay: $nextDay,
      nextWeek: $nextWeek,
      nextMonth: $nextMonth,
      noCloseDate: $noCloseDate,
      overdue: $overdue
      productIds: $productIds
    ) {
      _id
      name
      order
      amount
      itemsTotalCount
    }
  }
`;

const stageDetail = `
  query stageDetail($_id: String!, $modelName: String!) {
    stageDetail(_id: $_id, modelName: $modelName) {
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
  stageDetail
};
