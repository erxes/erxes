const commonParamsDef = `
  $name: String!,
  $type: String!
`;

const commonParams = `
  name: $name,
  type: $type
`;

const boardAdd = `
  mutation purchaseBoardsAdd(${commonParamsDef}) {
    purchaseBoardsAdd(${commonParams}) {
      _id
    }
  }
`;

const boardEdit = `
  mutation purchaseBoardsEdit($_id: String!, ${commonParamsDef}) {
    purchaseBoardsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const boardRemove = `
  mutation purchaseBoardsRemove($_id: String!) {
    purchaseBoardsRemove(_id: $_id)
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
  $tagId: String
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
`;

const pipelineAdd = `
  mutation purchasePipelinesAdd(${commonPipelineParamsDef}) {
    purchasePipelinesAdd(${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineEdit = `
  mutation purchasePipelinesEdit($_id: String!, ${commonPipelineParamsDef}) {
    purchasePipelinesEdit(_id: $_id, ${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineRemove = `
  mutation purchasePipelinesRemove($_id: String!) {
    purchasePipelinesRemove(_id: $_id)
  }
`;
const pipelinesArchive = `
  mutation purchasePipelinesArchive($_id: String!) {
    purchasePipelinesArchive(_id: $_id)
  }
`;

const pipelinesCopied = `
  mutation purchasePipelinesCopied($_id: String!) {
    purchasePipelinesCopied(_id: $_id)
  }
`;
const pipelinesUpdateOrder = `
  mutation purchasePipelinesUpdateOrder($orders: [OrderItem]) {
    purchasePipelinesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const manageExpenses = `
  mutation manageExpenses($expenseDocs: [ExpenseInput]) {
    manageExpenses(expenseDocs: $expenseDocs) {
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
  pipelinesUpdateOrder,
};
