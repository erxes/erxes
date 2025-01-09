const boards = `
  query tasksBoards($type: String!) {
    tasksBoards(type: $type) {
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
  query tasksBoardGetLast($type: String!) {
    tasksBoardGetLast(type: $type) {
      _id
      name
    }
  }
`;

const pipelines = `
  query tasksPipelines($boardId: String, $type: String, $isAll: Boolean) {
    tasksPipelines(boardId: $boardId, type: $type, isAll: $isAll) {
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
      branchIds
      numberSize
      nameConfig
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
  query tasksStages($pipelineId: String!, $isAll: Boolean) {
    tasksStages(pipelineId: $pipelineId, isAll: $isAll) {
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
  query tasksBoardDetail($_id: String!) {
    tasksBoardDetail(_id: $_id) {
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
  expenses
};
