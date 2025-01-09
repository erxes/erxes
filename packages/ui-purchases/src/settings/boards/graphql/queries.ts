const boards = `
  query purchasesBoards($type: String!) {
    purchasesBoards(type: $type) {
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
  query purchasesBoardGetLast($type: String!) {
    purchasesBoardGetLast(type: $type) {
      _id
      name
    }
  }
`;

const pipelines = `
  query purchasesPipelines($boardId: String, $type: String, $isAll: Boolean) {
    purchasesPipelines(boardId: $boardId, type: $type, isAll: $isAll) {
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
  query purchasesStages($pipelineId: String!, $isAll: Boolean) {
    purchasesStages(pipelineId: $pipelineId, isAll: $isAll) {
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
  query purchasesBoardDetail($_id: String!) {
    purchasesBoardDetail(_id: $_id) {
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
