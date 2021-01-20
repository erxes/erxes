const boards = `
  query boards($type: String!) {
    boards(type: $type) {
      _id
      name
    }
  }
`;

const boardGetLast = `
  query boardGetLast($type: String!) {
    boardGetLast(type: $type) {
      _id
      name
    }
  }
`;

const pipelines = `
  query pipelines($boardId: String!, $type: String) {
    pipelines(boardId: $boardId, type: $type) {
      _id
      name
      boardId
      visibility
      memberIds
      bgColor
      hackScoringType
      templateId
      startDate
      endDate
      metric
      isCheckUser
      excludeCheckUserIds
    }
  }
`;

const stages = `
  query stages($pipelineId: String!, $isAll: Boolean) {
    stages(pipelineId: $pipelineId, isAll: $isAll) {
      _id
      name
      probability
      pipelineId
      formId
      status
    }
  }
`;

const boardDetail = `
  query boardDetail($_id: String!) {
    boardDetail(_id: $_id) {
      _id
      name
      type
    }
  }
`;

export default {
  boards,
  pipelines,
  stages,
  boardGetLast,
  boardDetail
};
