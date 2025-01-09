const boards = `
  query ticketsBoards($type: String!) {
    ticketsBoards(type: $type) {
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
  query ticketsBoardGetLast($type: String!) {
    ticketsBoardGetLast(type: $type) {
      _id
      name
    }
  }
`;

const pipelines = `
  query ticketsPipelines($boardId: String, $type: String, $isAll: Boolean) {
    ticketsPipelines(boardId: $boardId, type: $type, isAll: $isAll) {
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
      branchIds
      departmentIds
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
  query ticketsStages($pipelineId: String!, $isAll: Boolean) {
    ticketsStages(pipelineId: $pipelineId, isAll: $isAll) {
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
  query ticketsBoardDetail($_id: String!) {
    ticketsBoardDetail(_id: $_id) {
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
