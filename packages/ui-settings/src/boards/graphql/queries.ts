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
    }
  }
`;

const pipelines = `
  query pipelines($boardId: String!, $type: String, $isAll: Boolean) {
    pipelines(boardId: $boardId, type: $type, isAll: $isAll) {
      _id
      name
      status
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
      numberConfig
      memberIds
      departmentIds
      numberSize
      age
      createdAt
      createdUser{
        details {
          fullName
        } 
      }
    }
  }
`;

const stages = `
  query stages($pipelineId: String!, $isAll: Boolean) {
    stages(pipelineId: $pipelineId, isAll: $isAll) {
      _id
      name
      probability
      visibility
      memberIds
      departmentIds
      pipelineId
      formId
      status
      code
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
