const boards = `
  query taskBoards($type: String!) {
    taskBoards(type: $type) {
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
  query taskBoardGetLast($type: String!) {
    taskBoardGetLast(type: $type) {
      _id
      name
    }
  }
`;

const pipelines = `
  query taskPipelines($boardId: String!, $type: String, $isAll: Boolean) {
    taskPipelines(boardId: $boardId, type: $type, isAll: $isAll) {
      _id
      name
      status
      tagId
      boardId
      visibility
      memberIds
      bgColor
      hackScoringType
      templateId
      startDate
      endDate
      metric
      isCheckDate
      isCheckUser
      isCheckDepartment
      excludeCheckUserIds
      numberConfig
      memberIds
      departmentIds
      numberSize
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
  query taskStages($pipelineId: String!, $isAll: Boolean) {
    taskStages(pipelineId: $pipelineId, isAll: $isAll) {
      _id
      name
      probability
      visibility
      memberIds
      canMoveMemberIds
      canEditMemberIds
      departmentIds
      pipelineId
      formId
      status
      code
      age
      defaultTick
    }
  }
`;

const boardDetail = `
  query taskBoardDetail($_id: String!) {
    taskBoardDetail(_id: $_id) {
      _id
      name
      type
    }
  }
`;

const expenses = `
  query expenses {
	  expenses {
      _id
      name
      description
      createdAt
      createdBy
    }
  }
`;

export default {
  boards,
  pipelines,
  stages,
  boardGetLast,
  boardDetail,
  expenses,
};
