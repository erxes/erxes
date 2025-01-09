const commonParamsDef = `
  $name: String!,
  $type: String!
`;

const commonParams = `
  name: $name,
  type: $type
`;

const boardAdd = `
  mutation tasksBoardsAdd(${commonParamsDef}) {
    tasksBoardsAdd(${commonParams}) {
      _id
    }
  }
`;

const boardEdit = `
  mutation tasksBoardsEdit($_id: String!, ${commonParamsDef}) {
    tasksBoardsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const boardRemove = `
  mutation tasksBoardsRemove($_id: String!) {
    tasksBoardsRemove(_id: $_id)
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
  $tagId: String,
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
  mutation tasksPipelinesAdd(${commonPipelineParamsDef}) {
    tasksPipelinesAdd(${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineEdit = `
  mutation tasksPipelinesEdit($_id: String!, ${commonPipelineParamsDef}) {
    tasksPipelinesEdit(_id: $_id, ${commonPipelineParams}) {
      _id
    }
  }
`;

const pipelineRemove = `
  mutation tasksPipelinesRemove($_id: String!) {
    tasksPipelinesRemove(_id: $_id)
  }
`;
const pipelinesArchive = `
  mutation tasksPipelinesArchive($_id: String!) {
    tasksPipelinesArchive(_id: $_id)
  }
`;

const pipelinesCopied = `
  mutation tasksPipelinesCopied($_id: String!) {
    tasksPipelinesCopied(_id: $_id)
  }
`;
const pipelinesUpdateOrder = `
  mutation tasksPipelinesUpdateOrder($orders: [TasksOrderItem]) {
    tasksPipelinesUpdateOrder(orders: $orders) {
      _id
    }
  }
`;

const manageExpenses = `
  mutation tasksManageExpenses($expenseDocs: [ExpenseInput]) {
    tasksManageExpenses(expenseDocs: $expenseDocs) {
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
