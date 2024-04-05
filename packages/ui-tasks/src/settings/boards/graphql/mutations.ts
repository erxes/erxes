const commonParamsDef = `
  $name: String!,
  $type: String!
`;

const commonParams = `
  name: $name,
  type: $type
`;

const boardAdd = `
  mutation taskBoardsAdd(${commonParamsDef}) {
    taskBoardsAdd(${commonParams}) {
      _id
    }
  }
`;

const boardEdit = `
  mutation taskBoardsEdit($_id: String!, ${commonParamsDef}) {
    taskBoardsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const boardRemove = `
  mutation taskBoardsRemove($_id: String!) {
    taskBoardsRemove(_id: $_id)
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
  mutation taskPipelinesAdd(${commonPipelineParamsDef}) {
    taskPipelinesAdd(${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineEdit = `
  mutation taskPipelinesEdit($_id: String!, ${commonPipelineParamsDef}) {
    taskPipelinesEdit(_id: $_id, ${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineRemove = `
  mutation taskPipelinesRemove($_id: String!) {
    taskPipelinesRemove(_id: $_id)
  }
`;
const pipelinesArchive = `
  mutation taskPipelinesArchive($_id: String!) {
    taskPipelinesArchive(_id: $_id)
  }
`;

const pipelinesCopied = `
  mutation taskPipelinesCopied($_id: String!) {
    taskPipelinesCopied(_id: $_id)
  }
`;
const pipelinesUpdateOrder = `
  mutation taskPipelinesUpdateOrder($orders: [OrderItem]) {
    taskPipelinesUpdateOrder(orders: $orders) {
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
