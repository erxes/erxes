const commonParamsDef = `
  $name: String!,
  $type: String!
`;

const commonParams = `
  name: $name,
  type: $type
`;

const boardAdd = `
  mutation salesBoardsAdd(${commonParamsDef}) {
    salesBoardsAdd(${commonParams}) {
      _id
    }
  }
`;

const boardEdit = `
  mutation salesBoardsEdit($_id: String!, ${commonParamsDef}) {
    salesBoardsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const boardRemove = `
  mutation salesBoardsRemove($_id: String!) {
    salesBoardsRemove(_id: $_id)
  }
`;

const commonPipelineParamsDef = `
  $name: String!,
  $boardId: String!,
  $stages: JSON,
  $type: String!,
  $visibility: String!,
  $memberIds: [String],
  $bgColor: String,
  $startDate: Date,
  $endDate: Date,
  $metric: String,
  $hackScoringType: String,
  $templateId: String,
  $isCheckDate: Boolean
  $isCheckUser: Boolean
  $isCheckDepartment: Boolean
  $excludeCheckUserIds: [String],
  $numberConfig: String
  $numberSize: String
  $nameConfig: String
  $departmentIds: [String],
  $branchIds: [String],
  $tagId: String,
  $initialCategoryIds: [String],
  $excludeCategoryIds: [String],
  $excludeProductIds: [String],
  $paymentIds: [String],
  $paymentTypes: JSON,
  $erxesAppToken: String
`;

const commonPipelineParams = `
  name: $name,
  boardId: $boardId,
  stages: $stages,
  type: $type,
  visibility: $visibility,
  memberIds: $memberIds,
  bgColor: $bgColor,
  hackScoringType: $hackScoringType,
  startDate: $startDate,
  endDate: $endDate,
  metric: $metric,
  templateId: $templateId,
  isCheckDate: $isCheckDate,
  isCheckUser: $isCheckUser,
  isCheckDepartment: $isCheckDepartment
  excludeCheckUserIds: $excludeCheckUserIds,
  numberConfig: $numberConfig
  numberSize: $numberSize
  nameConfig: $nameConfig
  branchIds: $branchIds
  departmentIds: $departmentIds
  tagId: $tagId
  initialCategoryIds: $initialCategoryIds
  excludeCategoryIds: $excludeCategoryIds
  excludeProductIds: $excludeProductIds
  paymentIds: $paymentIds
  paymentTypes: $paymentTypes
  erxesAppToken: $erxesAppToken
`;

const pipelineAdd = `
  mutation salesPipelinesAdd(${commonPipelineParamsDef}) {
    salesPipelinesAdd(${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineEdit = `
  mutation salesPipelinesEdit($_id: String!, ${commonPipelineParamsDef}) {
    salesPipelinesEdit(_id: $_id, ${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineRemove = `
  mutation salesPipelinesRemove($_id: String!) {
    salesPipelinesRemove(_id: $_id)
  }
`;
const pipelinesArchive = `
  mutation salesPipelinesArchive($_id: String!) {
    salesPipelinesArchive(_id: $_id)
  }
`;

const pipelinesCopied = `
  mutation salesPipelinesCopied($_id: String!) {
    salesPipelinesCopied(_id: $_id)
  }
`;
const pipelinesUpdateOrder = `
  mutation salesPipelinesUpdateOrder($orders: [SalesOrderItem]) {
    salesPipelinesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const manageExpenses = `
  mutation salesManageExpenses($expenseDocs: [ExpenseInput]) {
    salesManageExpenses(expenseDocs: $expenseDocs) {
      _id,
      name,
      description,
      createdAt,
      createdBy
    }
  }
`;

export default {
  boardAdd,
  manageExpenses,
  boardEdit,
  boardRemove,
  pipelineAdd,
  pipelineEdit,
  pipelinesArchive,
  pipelinesCopied,
  pipelineRemove,
  pipelinesUpdateOrder
};
