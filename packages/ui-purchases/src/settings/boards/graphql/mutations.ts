const commonParamsDef = `
  $name: String!,
  $type: String!
`;

const commonParams = `
  name: $name,
  type: $type
`;

const boardAdd = `
  mutation purchasesBoardsAdd(${commonParamsDef}) {
    purchasesBoardsAdd(${commonParams}) {
      _id
    }
  }
`;

const boardEdit = `
  mutation purchasesBoardsEdit($_id: String!, ${commonParamsDef}) {
    purchasesBoardsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const boardRemove = `
  mutation purchasesBoardsRemove($_id: String!) {
    purchasesBoardsRemove(_id: $_id)
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
  $departmentIds: [String],
  $tagId: String,
  $nameConfig:String,
  $branchIds: [String],
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
  departmentIds: $departmentIds
  tagId: $tagId
  nameConfig: $nameConfig
  branchIds: $branchIds
`;

const pipelineAdd = `
  mutation purchasesPipelinesAdd(${commonPipelineParamsDef}) {
    purchasesPipelinesAdd(${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineEdit = `
  mutation purchasesPipelinesEdit($_id: String!, ${commonPipelineParamsDef}) {
    purchasesPipelinesEdit(_id: $_id, ${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineRemove = `
  mutation purchasesPipelinesRemove($_id: String!) {
    purchasesPipelinesRemove(_id: $_id)
  }
`;
const pipelinesArchive = `
  mutation purchasesPipelinesArchive($_id: String!) {
    purchasesPipelinesArchive(_id: $_id)
  }
`;

const pipelinesCopied = `
  mutation purchasesPipelinesCopied($_id: String!) {
    purchasesPipelinesCopied(_id: $_id)
  }
`;
const pipelinesUpdateOrder = `
  mutation purchasesPipelinesUpdateOrder($orders: [PurchasesOrderItem]) {
    purchasesPipelinesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const manageExpenses = `
  mutation purchasesManageExpenses($expenseDocs: [ExpenseInput]) {
    purchasesManageExpenses(expenseDocs: $expenseDocs) {
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
