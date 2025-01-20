const boards = `
  query salesBoards($type: String!) {
    salesBoards(type: $type) {
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
  query salesBoardGetLast($type: String!) {
    salesBoardGetLast(type: $type) {
      _id
      name
    }
  }
`;

const pipelines = `
  query salesPipelines($boardId: String, $type: String, $isAll: Boolean) {
    salesPipelines(boardId: $boardId, type: $type, isAll: $isAll) {
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
      initialCategoryIds
      excludeCategoryIds
      excludeProductIds
      paymentIds
      paymentTypes
      erxesAppToken
    }
  }
`;

const stages = `
  query salesStages($pipelineId: String!, $isAll: Boolean) {
    salesStages(pipelineId: $pipelineId, isAll: $isAll) {
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
  query salesBoardDetail($_id: String!) {
    salesBoardDetail(_id: $_id) {
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
