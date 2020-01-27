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
  query pipelines($boardId: String!) {
    pipelines(boardId: $boardId) {
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
  query stages($pipelineId: String!) {
    stages(pipelineId: $pipelineId) {
      _id
      name
      probability
      pipelineId
      formId
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
